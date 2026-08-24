'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaDatabase, FaDownload, FaRedo, FaTable } from 'react-icons/fa';

interface CollectionStat {
  name: string;
  count: number;
}

export default function BackupsAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionStat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('iskcon_admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (!localStorage.getItem('iskcon_admin_token')) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/backups', { headers: authHeaders() });
      const result = await res.json();
      if (res.ok && result.data) {
        setCollections(result.data.collections || []);
        setGeneratedAt(new Date(result.data.generatedAt).toLocaleString('en-IN'));
      } else if (res.status === 401) {
        router.push('/admin/login');
      } else {
        setError(result.message || 'Failed to load backup statistics');
      }
    } catch (err) {
      console.error('Error loading backups:', err);
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch('/api/admin/backups?export=1', { headers: authHeaders() });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iskcon-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Backup download failed:', err);
      alert('Backup download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-16 h-16 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
              Database <span className="text-[#FF6B00]">Backups</span>
            </h1>
            <p className="text-gray-500 font-medium">
              Live collection statistics and full JSON export of website content.
              {generatedAt && <span className="text-gray-400"> — scanned {generatedAt}</span>}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadStats} className="px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-all">
              <FaRedo size={13} /> Refresh
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              <FaDownload /> {isDownloading ? 'Preparing...' : 'Download Full Backup'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm font-semibold">{error}</div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2">
            <FaTable className="text-orange-500" /> Collections ({collections.length})
          </h3>

          {collections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {collections.map(c => (
                <div key={c.name} className="border border-gray-100 rounded-2xl p-4 flex justify-between items-center hover:border-orange-200 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <FaDatabase className="text-orange-400 flex-shrink-0" size={14} />
                    <code className="text-sm font-bold text-gray-800 truncate">{c.name}</code>
                  </div>
                  <span className="text-sm font-black text-orange-600 flex-shrink-0 ml-2">{c.count.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 font-medium">No collections found or database unreachable.</div>
          )}
        </motion.div>

        <p className="mt-4 text-xs text-gray-400 leading-relaxed max-w-3xl">
          Note: user accounts and authentication tokens are excluded from exports for security. The download contains every other collection as JSON, suitable for re-import via mongoimport or custom scripts.
        </p>

      </div>
    </div>
  );
}
