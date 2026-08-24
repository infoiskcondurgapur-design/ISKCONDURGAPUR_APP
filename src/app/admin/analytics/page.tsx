'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, FaMapMarkerAlt, FaGlobe, FaArrowUp, FaArrowDown, 
  FaMobileAlt, FaLaptop, FaTabletAlt, FaSearch, FaChevronRight,
  FaCalendarAlt, FaChrome, FaSafari, FaFirefox
} from 'react-icons/fa';

export default function VisitorAnalytics() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // '24h', '7d', '30d'
  
  // Real-time fluctuating state for live visitors
  const [liveVisitors, setLiveVisitors] = useState(18);
  const [recentLiveActivity, setRecentLiveActivity] = useState<number[]>([
    12, 15, 14, 18, 22, 19, 16, 17, 18, 21, 20, 18
  ]);

  // Authenticate user
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('iskcon_admin_token');
      if (!authToken) {
        router.push('/admin/login');
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  // Fluctuating live visitor count simulation
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      setLiveVisitors(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // change by -2 to +2
        const next = Math.max(5, Math.min(60, prev + change));
        
        // Update live activity array
        setRecentLiveActivity(activity => {
          const updated = [...activity.slice(1), next];
          return updated;
        });
        
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-16 h-16 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Sample data that changes based on time range
  const getAnalyticsData = () => {
    switch(timeRange) {
      case '24h':
        return {
          views: '4,820',
          viewsChange: '+8.4%',
          viewsUp: true,
          unique: '1,940',
          uniqueChange: '+4.2%',
          uniqueUp: true,
          duration: '3m 12s',
          durationChange: '-2.1%',
          durationUp: false,
          bounce: '34.2%',
          bounceChange: '-1.5%',
          bounceUp: true, // lower bounce rate is good
          pages: [
            { path: '/', title: 'Home Page', views: 2120, unique: 940, avgTime: '2m 15s' },
            { path: '/resources/bhajans', title: 'Vaishnava Bhajans Songbook', views: 840, unique: 410, avgTime: '4m 45s' },
            { path: '/donate', title: 'Support Seva & Donation', views: 620, unique: 310, avgTime: '1m 55s' },
            { path: '/about/temple', title: 'Temple Information', views: 480, unique: 230, avgTime: '3m 05s' },
            { path: '/courses', title: 'Spiritual Courses', views: 410, unique: 180, avgTime: '2m 40s' },
            { path: '/events', title: 'Festivals & Events', views: 350, unique: 150, avgTime: '2m 10s' }
          ],
          sources: [
            { name: 'Direct', count: 1820, percentage: 38 },
            { name: 'Google Search', count: 1540, percentage: 32 },
            { name: 'WhatsApp', count: 910, percentage: 19 },
            { name: 'Facebook', count: 380, percentage: 8 },
            { name: 'YouTube Referrals', count: 170, percentage: 3 }
          ],
          devices: { mobile: 72, desktop: 23, tablet: 5 },
          locations: [
            { city: 'Durgapur', count: 1840, lat: '45%', lng: '52%' },
            { city: 'Kolkata', count: 1120, lat: '65%', lng: '68%' },
            { city: 'Asansol', count: 480, lat: '35%', lng: '42%' },
            { city: 'New Delhi', count: 390, lat: '20%', lng: '22%' },
            { city: 'Mumbai', count: 210, lat: '75%', lng: '18%' },
            { city: 'International', count: 780, lat: '50%', lng: '85%' }
          ]
        };
      case '30d':
        return {
          views: '112,490',
          viewsChange: '+18.9%',
          viewsUp: true,
          unique: '48,150',
          uniqueChange: '+12.4%',
          uniqueUp: true,
          duration: '3m 48s',
          durationChange: '+6.8%',
          durationUp: true,
          bounce: '31.8%',
          bounceChange: '-3.2%',
          bounceUp: true,
          pages: [
            { path: '/', title: 'Home Page', views: 49800, unique: 21200, avgTime: '2m 24s' },
            { path: '/resources/bhajans', title: 'Vaishnava Bhajans Songbook', views: 24100, unique: 10400, avgTime: '4m 30s' },
            { path: '/donate', title: 'Support Seva & Donation', views: 14500, unique: 7600, avgTime: '2m 08s' },
            { path: '/about/temple', title: 'Temple Information', views: 10200, unique: 5200, avgTime: '2m 55s' },
            { path: '/courses', title: 'Spiritual Courses', views: 8400, unique: 3100, avgTime: '2m 45s' },
            { path: '/events', title: 'Festivals & Events', views: 5490, unique: 2400, avgTime: '2m 18s' }
          ],
          sources: [
            { name: 'Google Search', count: 47240, percentage: 42 },
            { name: 'Direct', count: 33740, percentage: 30 },
            { name: 'WhatsApp', count: 16870, percentage: 15 },
            { name: 'Facebook', count: 9000, percentage: 8 },
            { name: 'YouTube Referrals', count: 5640, percentage: 5 }
          ],
          devices: { mobile: 78, desktop: 18, tablet: 4 },
          locations: [
            { city: 'Durgapur', count: 38240, lat: '45%', lng: '52%' },
            { city: 'Kolkata', count: 28400, lat: '65%', lng: '68%' },
            { city: 'Asansol', count: 11200, lat: '35%', lng: '42%' },
            { city: 'New Delhi', count: 9480, lat: '20%', lng: '22%' },
            { city: 'Mumbai', count: 6800, lat: '75%', lng: '18%' },
            { city: 'International', count: 18370, lat: '50%', lng: '85%' }
          ]
        };
      case '7d':
      default:
        return {
          views: '28,140',
          viewsChange: '+14.2%',
          viewsUp: true,
          unique: '11,850',
          uniqueChange: '+9.8%',
          uniqueUp: true,
          duration: '3m 34s',
          durationChange: '+4.5%',
          durationUp: true,
          bounce: '32.5%',
          bounceChange: '-2.4%',
          bounceUp: true,
          pages: [
            { path: '/', title: 'Home Page', views: 12450, unique: 5120, avgTime: '2m 21s' },
            { path: '/resources/bhajans', title: 'Vaishnava Bhajans Songbook', views: 6180, unique: 2480, avgTime: '4m 38s' },
            { path: '/donate', title: 'Support Seva & Donation', views: 3640, unique: 1820, avgTime: '2m 04s' },
            { path: '/about/temple', title: 'Temple Information', views: 2590, unique: 1240, avgTime: '2m 58s' },
            { path: '/courses', title: 'Spiritual Courses', views: 2010, unique: 760, avgTime: '2m 42s' },
            { path: '/events', title: 'Festivals & Events', views: 1270, unique: 590, avgTime: '2m 16s' }
          ],
          sources: [
            { name: 'Direct', count: 10690, percentage: 38 },
            { name: 'Google Search', count: 9850, percentage: 35 },
            { name: 'WhatsApp', count: 4220, percentage: 15 },
            { name: 'Facebook', count: 2250, percentage: 8 },
            { name: 'YouTube Referrals', count: 1130, percentage: 4 }
          ],
          devices: { mobile: 75, desktop: 20, tablet: 5 },
          locations: [
            { city: 'Durgapur', count: 9140, lat: '45%', lng: '52%' },
            { city: 'Kolkata', count: 6850, lat: '65%', lng: '68%' },
            { city: 'Asansol', count: 2840, lat: '35%', lng: '42%' },
            { city: 'New Delhi', count: 2190, lat: '20%', lng: '22%' },
            { city: 'Mumbai', count: 1850, lat: '75%', lng: '18%' },
            { city: 'International', count: 5270, lat: '50%', lng: '85%' }
          ]
        };
    }
  };

  const data = getAnalyticsData();

  // Helper to draw custom responsive chart path
  const chartHeight = 100;
  const chartWidth = 500;
  const maxVal = Math.max(...recentLiveActivity) || 1;
  const chartPoints = recentLiveActivity.map((val, idx) => {
    const x = (idx / (recentLiveActivity.length - 1)) * chartWidth;
    const y = chartHeight - (val / maxVal) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const chartAreaPath = `0,${chartHeight} ${chartPoints} ${chartWidth},${chartHeight}`;

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
              Monitor traffic metrics, user demographics, popular content, and active sessions in real-time.
            </p>
          </div>
          
          {/* Timeframe selector */}
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

        {/* Live Traffic Overlay Banner */}
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

              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Active Visitors Right Now</p>
              <h2 className="text-5xl font-black text-gray-900 mb-1 flex items-baseline gap-2">
                {liveVisitors}
                <span className="text-sm font-semibold text-emerald-500">users</span>
              </h2>
              <p className="text-xs text-gray-400 font-medium">Page views updating automatically</p>
            </div>

            {/* Sparkline for live visitors */}
            <div className="mt-6 h-14 w-full opacity-80">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="liveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area under curve */}
                <path d={chartAreaPath} fill="url(#liveGrad)" />
                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="4"
                  points={chartPoints}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Page Views Card */}
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
                <p className="text-xs text-gray-400 font-medium">Total visits to all pages</p>
              </div>
            </div>

            {/* Unique Visitors Card */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Unique Visitors</span>
                  <div className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${data.uniqueUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                    {data.uniqueUp ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                    {data.uniqueChange}
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">{data.unique}</h3>
                <p className="text-xs text-gray-400 font-medium">Distinct browser sessions</p>
              </div>
            </div>

            {/* Session Duration & Bounce Rate */}
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
            <p className="text-gray-400 text-sm mb-6 font-medium">Distribution of visitors by locations, with focus on West Bengal & India.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* Map representation (SVG Styled) */}
              <div className="md:col-span-2 relative h-[250px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                {/* Simulated geographic shapes using absolute div elements */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-400 via-transparent to-transparent"></div>
                
                {/* Simplified SVG Map representation */}
                <svg className="w-5/6 h-5/6 text-slate-200 fill-current" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50,10 C 60,15 70,12 80,20 C 90,30 85,50 82,60 C 80,70 70,85 50,90 C 30,85 20,70 18,60 C 15,50 10,30 20,20 C 30,12 40,15 50,10 Z" className="text-slate-100 stroke-2 stroke-slate-200" />
                  <path d="M 50,30 C 55,32 58,30 62,35 C 65,40 62,45 61,48 C 60,52 56,58 50,60 C 44,58 40,52 39,48 C 38,45 35,40 38,35 C 42,30 45,32 50,30 Z" className="text-orange-50 fill-orange-50 stroke-1 stroke-orange-100" />
                </svg>

                {/* Pulsing Hotspots */}
                {data.locations.map((loc, i) => (
                  <div 
                    key={loc.city} 
                    className="absolute"
                    style={{ top: loc.lat, left: loc.lng }}
                  >
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-600"></span>
                    </span>
                    {/* Tooltip */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap z-20">
                      {loc.city} ({loc.count})
                    </div>
                  </div>
                ))}
              </div>

              {/* Location List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Top Locations</h4>
                {data.locations.slice(0, 5).map(loc => (
                  <div key={loc.city} className="flex justify-between items-center text-sm font-medium">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-orange-500 text-xs" />
                      {loc.city}
                    </span>
                    <span className="text-gray-900 font-bold">{loc.count}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Device and Browser Stats */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight flex items-center gap-2">
              <FaLaptop className="text-orange-500" /> Device Statistics
            </h3>
            <p className="text-gray-400 text-sm mb-6 font-medium">Sessions split by user devices.</p>

            <div className="space-y-6 pt-2">
              
              {/* Mobile */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-gray-700 flex items-center gap-2"><FaMobileAlt className="text-orange-500" /> Mobile</span>
                  <span className="text-gray-900">{data.devices.mobile}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${data.devices.mobile}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-orange-500 h-full rounded-full"
                  ></motion.div>
                </div>
              </div>

              {/* Desktop */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-gray-700 flex items-center gap-2"><FaLaptop className="text-blue-500" /> Desktop</span>
                  <span className="text-gray-900">{data.devices.desktop}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${data.devices.desktop}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-blue-500 h-full rounded-full"
                  ></motion.div>
                </div>
              </div>

              {/* Tablet */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-gray-700 flex items-center gap-2"><FaTabletAlt className="text-emerald-500" /> Tablet</span>
                  <span className="text-gray-900">{data.devices.tablet}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${data.devices.tablet}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-emerald-500 h-full rounded-full"
                  ></motion.div>
                </div>
              </div>

            </div>

            {/* Browser breakdown in small footer list */}
            <div className="mt-8 pt-6 border-t border-gray-50 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <div>
                <FaChrome className="text-orange-400 mx-auto mb-1" size={16} />
                <span className="text-gray-500 block">Chrome</span>
                <span className="text-gray-800">64.2%</span>
              </div>
              <div>
                <FaSafari className="text-blue-400 mx-auto mb-1" size={16} />
                <span className="text-gray-500 block">Safari</span>
                <span className="text-gray-800">22.8%</span>
              </div>
              <div>
                <FaFirefox className="text-orange-600 mx-auto mb-1" size={16} />
                <span className="text-gray-500 block">Firefox</span>
                <span className="text-gray-800">8.4%</span>
              </div>
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
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Page Path</th>
                    <th className="pb-3 px-4">Views</th>
                    <th className="pb-3 px-4">Unique Visitors</th>
                    <th className="pb-3 pl-4">Avg. Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.pages.map(page => (
                    <tr key={page.path} className="group">
                      <td className="py-4 pr-4 text-sm font-semibold text-gray-800 max-w-[200px] truncate">
                        <span className="text-gray-400 font-normal mr-2 block text-xs md:inline">{page.title}</span>
                        <code className="text-xs bg-gray-50 px-2 py-1 rounded text-orange-600 font-bold font-mono">{page.path}</code>
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-gray-900">{page.views.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-500">{page.unique.toLocaleString('en-IN')}</td>
                      <td className="py-4 pl-4 text-sm font-medium text-gray-500">{page.avgTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight flex items-center gap-2">
              <FaSearch className="text-orange-500" /> Traffic Sources
            </h3>
            <p className="text-gray-400 text-sm mb-6 font-medium">Channels where your visitors came from.</p>

            <div className="space-y-5">
              {data.sources.map((source, i) => (
                <div key={source.name} className="group">
                  <div className="flex justify-between items-center text-sm font-semibold mb-1.5">
                    <span className="text-gray-700">{source.name}</span>
                    <span className="text-gray-500 font-medium">
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
            </div>

            <div className="mt-8 bg-orange-50/50 border border-orange-100/30 rounded-2xl p-4 text-xs font-semibold text-orange-800 leading-relaxed">
              💡 <span className="font-bold">Optimization Tip:</span> Direct traffic and search volume represent over 70% of visits. Promoting bhajan lyrics and temple notices on WhatsApp status lists will drive higher engagement spikes.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
