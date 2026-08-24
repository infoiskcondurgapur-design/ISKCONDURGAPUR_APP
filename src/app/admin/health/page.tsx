'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaDatabase, FaCheckCircle, FaTimesCircle, FaClock, FaRedo, FaServer } from 'react-icons/fa';

interface HealthData {
  status: string;
  database: { status: string; latencyMs?: number; error?: string };
  memoryMB: number;
  nodeVersion: string;
  timestamp: string;
}

interface EndpointCheck {
  name: string;
  path: string;
  status: 'checking' | 'up' | 'down';
  latencyMs?: number;
}

export default function HealthAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [endpoints, setEndpoints] = useState<EndpointCheck[]>([
    { name: 'Health API', path: '/api/health', status: 'checking' },
    { name: 'Settings API', path: '/api/settings', status: 'checking' },
    { name: 'Visitors API', path: '/api/visitors', status: 'checking' },
    { name: 'Resources API', path: '/api/resources', status: 'checking' },
    { name: 'Events API', path: '/api/events', status: 'checking' },
  ]);

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('iskcon_admin_token');
      if (!authToken) {
        router.push('/admin/login');
        return;
      }
      setIsAuthenticated(true);
      runChecks();
    };
    checkAuth();
  }, [router]);

  const runChecks = async () => {
    // Server health (database connectivity is checked server-side)
    try {
      const res = await fetch(`/api/health?t=${Date.now()}`);
      const result = await res.json();
      setHealth(result.data);
    } catch {
      setHealth(null);
    }

    // Client-side reachability of key endpoints
    setEndpoints(prev => prev.map(e => ({ ...e, status: 'checking' })));
    for (const ep of endpoints) {
      const start = performance.now();
      try {
        await fetch(`${ep.path}?t=${Date.now()}`, { cache: 'no-store' });
        setEndpoints(prev => prev.map(e =>
          e.path === ep.path ? { ...e, status: 'up', latencyMs: Math.round(performance.now() - start) } : e
        ));
      } catch {
        setEndpoints(prev => prev.map(e =>
          e.path === ep.path ? { ...e, status: 'down' } : e
        ));
      }
    }
    setLastChecked(new Date().toLocaleTimeString('en-IN'));
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-16 h-16 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const dbUp = health?.database?.status === 'connected';

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
              System <span className="text-[#FF6B00]">Health</span>
            </h1>
            <p className="text-gray-500 font-medium">
              Live connectivity checks for the database and core APIs.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastChecked && (
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                <FaClock size={11} /> Last checked {lastChecked}
              </span>
            )}
            <button
              onClick={runChecks}
              className="px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-all"
            >
              <FaRedo size={13} /> Run Checks
            </button>
          </div>
        </div>

        {/* Overall status banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-8 mb-10 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
            health?.status === 'healthy'
              ? 'bg-emerald-50/60 border-emerald-100'
              : 'bg-amber-50/60 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-4">
            {health?.status === 'healthy' ? (
              <FaHeartbeat className="text-emerald-500" size={32} />
            ) : (
              <FaHeartbeat className="text-amber-500" size={32} />
            )}
            <div>
              <h2 className="text-2xl font-black text-gray-900 capitalize">{health?.status || 'Unknown'}</h2>
              <p className="text-sm text-gray-500 font-medium">
                {dbUp ? 'All critical systems operational.' : 'Database unreachable — the site is running on fallback data stores.'}
              </p>
            </div>
          </div>
          <span className={`w-3.5 h-3.5 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
        </motion.div>

        {/* Database & Runtime cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">MongoDB Database</span>
              <FaDatabase className={dbUp ? 'text-emerald-500' : 'text-red-400'} size={18} />
            </div>
            <h3 className={`text-2xl font-black capitalize mb-1 ${dbUp ? 'text-emerald-600' : 'text-red-500'}`}>
              {health?.database?.status || 'Unknown'}
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              {dbUp && health?.database?.latencyMs != null
                ? `Connected in ${health.database.latencyMs} ms`
                : health?.database?.error || 'Waiting for check...'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Runtime Memory (RSS)</span>
              <FaServer className="text-blue-500" size={18} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-1">{health?.memoryMB ?? '—'} MB</h3>
            <p className="text-xs text-gray-400 font-medium">Current server instance footprint</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Node Runtime</span>
              <FaServer className="text-emerald-500" size={18} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-1">v{health?.nodeVersion?.replace('v', '') ?? '—'}</h3>
            <p className="text-xs text-gray-400 font-medium">Next.js server environment</p>
          </div>
        </div>

        {/* Endpoint checks */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">API Endpoint Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {endpoints.map(ep => (
              <div key={ep.path} className="border border-gray-100 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-800">{ep.name}</p>
                  <code className="text-xs text-orange-600 font-mono bg-orange-50 px-2 py-0.5 rounded">{ep.path}</code>
                </div>
                <div className="text-right">
                  {ep.status === 'checking' ? (
                    <span className="inline-block w-4 h-4 border-t-2 border-orange-400 rounded-full animate-spin"></span>
                  ) : ep.status === 'up' ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                      <FaCheckCircle size={14} /> {ep.latencyMs}ms
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-500 font-bold text-sm">
                      <FaTimesCircle size={14} /> Down
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
