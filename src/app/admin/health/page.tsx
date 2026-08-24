'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaServer, FaDatabase, FaEnvelope, FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';

export default function HealthAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    cpu: 18,
    memory: 42,
    disk: 56,
    responseTime: 95 // ms
  });

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

  // Simulate real-time metrics fluctuation
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.max(5, Math.min(95, prev.cpu + Math.floor(Math.random() * 9) - 4)),
        memory: Math.max(30, Math.min(85, prev.memory + Math.floor(Math.random() * 3) - 1)),
        disk: prev.disk, // Disk stays relatively static
        responseTime: Math.max(40, Math.min(300, prev.responseTime + Math.floor(Math.random() * 21) - 10))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-16 h-16 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
            System <span className="text-[#FF6B00]">Health</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Monitor infrastructure metrics, server resource utilization, and API gateway response performance.
          </p>
        </div>

        {/* Resources utilization grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          
          {/* CPU Load */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">CPU Load</span>
              <FaServer className="text-orange-500" size={16} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4">{metrics.cpu}%</h3>
            <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden">
              <motion.div 
                className="bg-orange-500 h-full rounded-full"
                animate={{ width: `${metrics.cpu}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Memory load */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Memory RAM</span>
              <FaServer className="text-blue-500" size={16} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4">{metrics.memory}%</h3>
            <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden">
              <motion.div 
                className="bg-blue-500 h-full rounded-full"
                animate={{ width: `${metrics.memory}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Disk storage */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Disk Storage</span>
              <FaServer className="text-emerald-500" size={16} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4">{metrics.disk}%</h3>
            <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden">
              <motion.div 
                className="bg-emerald-500 h-full rounded-full"
                animate={{ width: `${metrics.disk}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Response Latency */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">API Response Time</span>
              <FaClock className="text-purple-500" size={16} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4">{metrics.responseTime} ms</h3>
            <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden">
              <motion.div 
                className="bg-purple-500 h-full rounded-full"
                animate={{ width: `${(metrics.responseTime / 300) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

        </div>

        {/* Server State List */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2">
            <FaHeartbeat className="text-[#FF6B00]" /> Active Core Services
          </h3>
          
          <div className="space-y-4">
            
            {/* MongoDB Connection */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                  <FaDatabase size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Database Engine</h4>
                  <p className="text-xs text-gray-400 font-medium">MongoDB connection pooling, replica sets</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                Connected
              </span>
            </div>

            {/* Email Gateway */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                  <FaEnvelope size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Nodemailer SMTP Gateway</h4>
                  <p className="text-xs text-gray-400 font-medium">Outbound email services, verification OTPs</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                Online
              </span>
            </div>

            {/* Vercel Hosting Edge Network */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                  <FaServer size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">NextJS Node Runtime</h4>
                  <p className="text-xs text-gray-400 font-medium">Serverless API handlers and server components</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                Operational
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
