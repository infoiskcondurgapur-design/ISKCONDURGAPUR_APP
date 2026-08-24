'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaUsers, FaMapMarkerAlt, FaGlobe, FaArrowUp, FaArrowDown,
  FaMobileAlt, FaLaptop, FaTabletAlt, FaSearch, FaChevronRight,
  FaChrome, FaSafari, FaFirefox, FaExclamationCircle
} from 'react-icons/fa';

interface AnalyticsData {
  views: string;
  viewsChange: string;
  viewsUp: boolean;
  unique: string;
  uniqueChange: string;
  uniqueUp: boolean;
  bounce: string;
  bounceChange: string;
  bounceUp: boolean;
  pages: { path: string; title: string; views: number; unique: number; avgTime: string }[];
  sources: { name: string; count: number; percentage: number }[];
  devices: { mobile: number; desktop: number; tablet: number };
  browsers: Record<string, string>;
  locations: { city: string; count: number; lat: string; lng: string }[];
  live: { count: number; activity: number[] };
}

const EMPTY_DATA: AnalyticsData = {
  views: '0', viewsChange: '+0.0%', viewsUp: true,
  unique: '0', uniqueChange: '+0.0%', uniqueUp: true,
  bounce: '0.0%', bounceChange: '+0.0%', bounceUp: true,
  pages: [], sources: [], devices: { mobile: 0, desktop: 0, tablet: 0 },
  browsers: { Chrome: '0%', Safari: '0%', Firefox: '0%' },
  locations: [], live: { count: 0, activity: Array(12).fill(0) }
};

export default function VisitorAnalytics() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState<AnalyticsData>(EMPTY_DATA);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('iskcon_admin_token');
      if (!authToken) {
        router.push('/admin/login');
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/admin/analytics?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('iskcon_admin_token')}` }
        });
        if (!active) return;
        if (res.ok) {
          setData(await res.json());
          setFetchError(null);
        } else if (res.status === 401) {
          router.push('/admin/login');
        } else {
          setFetchError('Failed to load analytics data');
        }
      } catch (err) {
        if (active) setFetchError('Failed to connect to the server');
      }
    };

    fetchAnalytics();
    // Refresh live counters periodically
    const interval = setInterval(fetchAnalytics, 30000);
    return () => { active = false; clearInterval(interval); };
  }, [isAuthenticated, timeRange, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-16 h-16 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const chartHeight = 100;
  const chartWidth = 500;
  const activity = data.live.activity.length ? data.live.activity : Array(12).fill(0);
  const maxVal = Math.max(...activity) || 1;
  const chartPoints = activity.map((val, idx) => {
    const x = (idx / (activity.length - 1)) * chartWidth;
    const y = chartHeight - (val / maxVal) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');
  const chartAreaPath = `0,${chartHeight} ${chartPoints} ${chartWidth},${chartHeight}`;

  const browserIcons: Record<string, JSX.Element> = {
    Chrome: <FaChrome className="text-orange-400 mx-auto mb-1" size={16} />,
    Safari: <FaSafari className="text-blue-400 mx-auto mb-1" size={16} />,
    Firefox: <FaFirefox className="text-orange-600 mx-auto mb-1" size={16} />,
  };

  const topBrowsers = ['Chrome', 'Safari', 'Firefox'].map(b => ({ name: b, share: data.browsers?.[b] || '0%' }));

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
              Visitor <span className="text-[#FF6B00]">Analytics</span>
            </h1>
            <p className="text-gray-500 font-medium">
              Real traffic recorded from site visitors. Live counters refresh every 30 seconds.
            </p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            {[
              { id: '24h', name: '24 Hours' },
              { id: '7d', name: '7 Days' },
              { id: '30d', name: '30 Days' }
            ].map(range => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  timeRange === range.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {range.name}
              </button>
            ))}
          </div>
        </div>

        {fetchError && (
          <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm font-semibold flex items-center gap-2">
            <FaExclamationCircle /> {fetchError} — verify MongoDB connectivity and admin authentication.
          </div>
        )}

        {/* Live + Core Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Live Visitors Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between relative overflow-hidden group lg:col-span-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500"></div>

            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-2 uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                  Live Monitor
                </span>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                  <FaUsers size={18} />
                </div>
              </div>

              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Active Visitors (last 5 min)</p>
              <h2 className="text-5xl font-black text-gray-900 mb-1 flex items-baseline gap-2">
                {data.live.count}
                <span className="text-sm font-semibold text-emerald-500">users</span>
              </h2>
              <p className="text-xs text-gray-400 font-medium">Distinct sessions in the last five minutes</p>
            </div>

            <div className="mt-6 h-14 w-full opacity-80">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="liveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={chartAreaPath} fill="url(#liveGrad)" />
                <polyline fill="none" stroke="#10B981" strokeWidth="4" points={chartPoints} strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">

            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Page Views</span>
                  <div className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${data.viewsUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                    {data.viewsUp ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                    {data.viewsChange}
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">{data.views}</h3>
                <p className="text-xs text-gray-400 font-medium">Total visits in selected period</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Unique Sessions</span>
                  <div className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${data.uniqueUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                    {data.uniqueUp ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                    {data.uniqueChange}
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">{data.unique}</h3>
                <p className="text-xs text-gray-400 font-medium">Distinct browser sessions</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bounce Rate</span>
                  <div className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${data.bounceUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                    {data.bounceUp ? <FaArrowDown size={10} /> : <FaArrowUp size={10} />}
                    {data.bounceChange}
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">{data.bounce}</h3>
                <p className="text-xs text-gray-400 font-medium">Single-page sessions</p>
              </div>
            </div>

          </div>
        </div>

        {/* Map and Devices Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">

          {/* Geographic Map Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight flex items-center gap-2">
              <FaGlobe className="text-orange-500" /> Geographic Visitor Map
            </h3>
            <p className="text-gray-400 text-sm mb-6 font-medium">Visitor distribution by location.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 relative h-[250px] bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-400 via-transparent to-transparent"></div>

                <svg className="w-5/6 h-5/6 absolute inset-0 m-auto text-slate-200 fill-current" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50,10 C 60,15 70,12 80,20 C 90,30 85,50 82,60 C 80,70 70,85 50,90 C 30,85 20,70 18,60 C 15,50 10,30 20,20 C 30,12 40,15 50,10 Z" />
                  <path d="M 50,30 C 55,32 58,30 62,35 C 65,40 62,45 61,48 C 60,52 56,58 50,60 C 44,58 40,52 39,48 C 38,45 35,40 38,35 C 42,30 45,32 50,30 Z" className="fill-orange-50" />
                </svg>

                {data.locations.slice(0, 8).map(loc => (
                  <div key={loc.city} className="absolute" style={{ top: loc.lat, left: loc.lng }}>
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-600"></span>
                    </span>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap z-20">
                      {loc.city} ({loc.count})
                    </div>
                  </div>
                ))}

                {data.locations.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 font-medium">
                    No location data yet for this period
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Top Locations</h4>
                {data.locations.slice(0, 5).map(loc => (
                  <div key={loc.city} className="flex justify-between items-center text-sm font-medium">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-orange-500 text-xs" />
                      {loc.city}
                    </span>
                    <span className="text-gray-900 font-bold">{loc.count.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                {data.locations.length === 0 && <p className="text-sm text-gray-400">—</p>}
              </div>

            </div>
          </div>

          {/* Device Stats */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight flex items-center gap-2">
              <FaLaptop className="text-orange-500" /> Device Statistics
            </h3>
            <p className="text-gray-400 text-sm mb-6 font-medium">Sessions split by user devices.</p>

            <div className="space-y-6 pt-2">
              {[
                { label: 'Mobile', value: data.devices.mobile, icon: <FaMobileAlt className="text-orange-500" />, color: 'bg-orange-500' },
                { label: 'Desktop', value: data.devices.desktop, icon: <FaLaptop className="text-blue-500" />, color: 'bg-blue-500' },
                { label: 'Tablet', value: data.devices.tablet, icon: <FaTabletAlt className="text-emerald-500" />, color: 'bg-emerald-500' },
              ].map(device => (
                <div key={device.label}>
                  <div className="flex justify-between items-center text-sm font-semibold mb-2">
                    <span className="text-gray-700 flex items-center gap-2">{device.icon} {device.label}</span>
                    <span className="text-gray-900">{device.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${device.value}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`${device.color} h-full rounded-full`}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              {topBrowsers.map(b => (
                <div key={b.name}>
                  {browserIcons[b.name]}
                  <span className="text-gray-500 block">{b.name}</span>
                  <span className="text-gray-800">{b.share}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Popular Pages & Traffic Sources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Most Viewed Pages */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 lg:col-span-2 overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight flex items-center gap-2">
              <FaChevronRight className="text-orange-500" /> Most Viewed Pages
            </h3>
            <p className="text-gray-400 text-sm mb-6 font-medium">Rankings of website pages based on total visitor count.</p>

            <div className="overflow-x-auto">
              {data.pages.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3 pr-4">Page Path</th>
                      <th className="pb-3 px-4">Views</th>
                      <th className="pb-3 px-4">Unique Visitors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.pages.map(page => (
                      <tr key={page.path} className="group">
                        <td className="py-4 pr-4 text-sm font-semibold text-gray-800 max-w-[240px] truncate">
                          <code className="text-xs bg-gray-50 px-2 py-1 rounded text-orange-600 font-bold font-mono">{page.path}</code>
                        </td>
                        <td className="py-4 px-4 text-sm font-bold text-gray-900">{page.views.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-500">{page.unique.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-gray-500 font-medium">
                  No page views recorded yet for this period.
                </div>
              )}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight flex items-center gap-2">
              <FaSearch className="text-orange-500" /> Traffic Sources
            </h3>
            <p className="text-gray-400 text-sm mb-6 font-medium">Referrers your visitors came from.</p>

            <div className="space-y-5">
              {data.sources.filter(s => s.count > 0).slice(0, 6).map((source, i) => (
                <div key={source.name} className="group">
                  <div className="flex justify-between items-center text-sm font-semibold mb-1.5">
                    <span className="text-gray-700 truncate mr-2">{source.name}</span>
                    <span className="text-gray-500 font-medium whitespace-nowrap">
                      {source.count.toLocaleString('en-IN')}{' '}
                      <span className="text-xs text-gray-400 font-bold">({source.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${source.percentage}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="bg-gradient-to-r from-orange-400 to-[#FF6B00] h-full rounded-full"
                    ></motion.div>
                  </div>
                </div>
              ))}
              {data.sources.filter(s => s.count > 0).length === 0 && (
                <p className="text-sm text-gray-400 font-medium">No referral data yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
