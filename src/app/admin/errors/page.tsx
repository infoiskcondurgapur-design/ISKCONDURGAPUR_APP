'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaTrash, FaCheck, FaInfoCircle } from 'react-icons/fa';

interface SystemError {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARN';
  message: string;
  context: string;
  resolved: boolean;
}

export default function ErrorsAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<SystemError[]>([
    { id: '1', timestamp: '2026-06-11 14:04:12', level: 'ERROR', message: 'Winston logger instance initialization timeout', context: 'src/utils/logger.ts:24', resolved: false },
    { id: '2', timestamp: '2026-06-11 09:32:04', level: 'WARN', message: 'NextJS legacy property "layout" used in NextImage component', context: 'src/app/about/page.tsx:120', resolved: false },
    { id: '3', timestamp: '2026-06-10 18:45:10', level: 'ERROR', message: 'JWT admin token decode failed: Signature verification failed', context: 'src/middleware/jwtVerify.ts:85', resolved: true },
    { id: '4', timestamp: '2026-06-09 23:15:30', level: 'ERROR', message: 'MongoDB connection dropped unexpectedly, initiating retry...', context: 'src/utils/dbConnect.ts:44', resolved: true }
  ]);

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

  const handleResolve = (id: string) => {
    setErrors(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
  };

  const handleClear = () => {
    setErrors([]);
  };

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
              Diagnostics &amp; <span className="text-[#FF6B00]">Errors</span>
            </h1>
            <p className="text-gray-500 font-medium">
              Review real-time application crashes, warning messages, and stack-traces logged by the runtime.
            </p>
          </div>
          
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <FaTrash />
            Clear Diagnostics Log
          </button>
        </div>

        {/* Errors Table */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2">
            <FaExclamationTriangle className="text-orange-500" /> Active Exceptions Logs ({errors.filter(e => !e.resolved).length})
          </h3>
          
          <div className="overflow-x-auto">
            {errors.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Timestamp</th>
                    <th className="pb-3 px-4">Severity</th>
                    <th className="pb-3 px-4">Error Exception Message</th>
                    <th className="pb-3 px-4">Location Path</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {errors.map(error => (
                    <tr key={error.id} className="group">
                      <td className="py-4 pr-4 text-sm font-semibold text-gray-400 font-mono">
                        {error.timestamp}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          error.level === 'ERROR' 
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {error.level}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-800 font-mono max-w-[350px] truncate">
                        {error.message}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-500 font-mono text-xs">{error.context}</td>
                      <td className="py-4 px-4 text-sm font-medium">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          error.resolved 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-rose-50 text-rose-500 border border-rose-100'
                        }`}>
                          {error.resolved ? 'Resolved' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-sm text-right">
                        {!error.resolved && (
                          <button 
                            onClick={() => handleResolve(error.id)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-600 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5"
                            title="Mark as Resolved"
                          >
                            <FaCheck size={12} /> Resolve
                          </button>
                        )}
                        {error.resolved && (
                          <span className="text-gray-400 text-xs font-semibold flex justify-end items-center gap-1">
                            <FaInfoCircle /> Resolved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500 font-medium">
                No system errors in logs! Your application is running perfectly.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
