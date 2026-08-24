'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaTrash, FaCheckCircle, FaInfoCircle, FaRedo } from 'react-icons/fa';

interface SystemError {
  _id: string;
  timestamp: string;
  createdAt: string;
  level?: string;
  message: string;
  name: string;
  statusCode: number;
  stack?: string;
}

export default function ErrorsAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('iskcon_admin_token');
      if (!authToken) {
        router.push('/admin/login');
        return;
      }
      setIsAuthenticated(true);
      loadErrors();
    };
    checkAuth();
  }, [router]);

  const loadErrors = async () => {
    try {
      setFetchError(null);
      const res = await fetch('/api/admin/errors', {
        headers: { Authorization: `Bearer ${localStorage.getItem('iskcon_admin_token')}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        setErrors(result.data);
      } else {
        setFetchError(result.message || 'Failed to load error logs');
      }
    } catch (err) {
      console.error('Error fetching error logs:', err);
      setFetchError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      const res = await fetch('/api/admin/errors', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('iskcon_admin_token')}` }
      });
      if (res.ok) {
        setErrors([]);
      }
    } catch (err) {
      console.error('Error clearing logs:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-16 h-16 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

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
              Server-side exceptions (HTTP 500+) captured by the API error handler. Last 50 entries.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadErrors}
              className="px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-all"
            >
              <FaRedo size={13} /> Refresh
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              <FaTrash />
              Clear Logs
            </button>
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm font-semibold">
            {fetchError} — showing logs from the database failed. Verify MongoDB connectivity.
          </div>
        )}

        {/* Errors Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2">
            <FaExclamationTriangle className="text-orange-500" /> Server Error Log ({errors.length})
          </h3>

          <div className="overflow-x-auto">
            {errors.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Timestamp</th>
                    <th className="pb-3 px-4">Severity</th>
                    <th className="pb-3 px-4">Exception Message</th>
                    <th className="pb-3 px-4">Type</th>
                    <th className="pb-3 pl-4">Status Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {errors.map(error => (
                    <tr key={error._id} className="group">
                      <td className="py-4 pr-4 text-sm font-semibold text-gray-400 font-mono whitespace-nowrap">
                        {formatDate(error.createdAt || error.timestamp)}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                          ERROR
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-800 max-w-[420px]">
                        <span className="block truncate" title={error.message}>{error.message}</span>
                        {error.stack && (
                          <details className="mt-1">
                            <summary className="text-xs text-gray-400 cursor-pointer select-none">Stack trace</summary>
                            <pre className="mt-1 text-[11px] bg-gray-50 rounded-lg p-2 overflow-x-auto text-gray-500">{error.stack}</pre>
                          </details>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-500 font-mono text-xs">{error.name}</td>
                      <td className="py-4 pl-4 text-sm font-bold text-rose-500">{error.statusCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500 font-medium flex flex-col items-center gap-2">
                <FaCheckCircle className="text-emerald-400" size={28} />
                No server errors in the log. Your application is running perfectly.
              </div>
            )}
          </div>
        </motion.div>

        <p className="mt-4 text-xs text-gray-400 flex items-center gap-1.5">
          <FaInfoCircle /> Errors are captured automatically by the central API error handler whenever a request fails with HTTP 500+ and MongoDB is reachable.
        </p>

      </div>
    </div>
  );
}
