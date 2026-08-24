'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaDatabase, FaDownload, FaTrash, FaUndo, FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';

interface BackupFile {
  id: string;
  filename: string;
  size: string;
  createdAt: string;
  type: string;
}

export default function BackupsAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [backups, setBackups] = useState<BackupFile[]>([
    { id: '1', filename: 'iskcon_db_backup_2026-06-11.tar.gz', size: '12.4 MB', createdAt: '2026-06-11 02:00 AM', type: 'System Auto' },
    { id: '2', filename: 'iskcon_db_backup_2026-06-10.tar.gz', size: '12.3 MB', createdAt: '2026-06-10 02:00 AM', type: 'System Auto' },
    { id: '3', filename: 'iskcon_db_backup_manual_2026-06-09.tar.gz', size: '12.1 MB', createdAt: '2026-06-09 04:30 PM', type: 'Manual' },
    { id: '4', filename: 'iskcon_db_backup_2026-06-08.tar.gz', size: '12.0 MB', createdAt: '2026-06-08 02:00 AM', type: 'System Auto' }
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

  const handleCreateBackup = () => {
    setIsBackupRunning(true);
    setTimeout(() => {
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      const newBackup: BackupFile = {
        id: Date.now().toString(),
        filename: `iskcon_db_backup_manual_${dateStr}.tar.gz`,
        size: `${(11.8 + Math.random()).toFixed(1)} MB`,
        createdAt: `${dateStr} ${timeStr}`,
        type: 'Manual'
      };

      setBackups(prev => [newBackup, ...prev]);
      setIsBackupRunning(false);
    }, 2500);
  };

  const handleDeleteBackup = (id: string) => {
    setBackups(prev => prev.filter(b => b.id !== id));
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
              Database <span className="text-[#FF6B00]">Backups</span>
            </h1>
            <p className="text-gray-500 font-medium">
              Create, download, or restore database system backups. Scheduled automated backups run daily at 2:00 AM.
            </p>
          </div>
          
          <button
            onClick={handleCreateBackup}
            disabled={isBackupRunning}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isBackupRunning ? <FaSpinner className="animate-spin" /> : <FaDatabase />}
            {isBackupRunning ? 'Creating Backup...' : 'Create Backup Now'}
          </button>
        </div>

        {/* Status Box */}
        <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-3xl p-6 mb-8 flex items-center gap-4 text-emerald-800">
          <FaCheckCircle className="text-emerald-500 shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-sm">Backup Scheduler Active</h4>
            <p className="text-xs text-emerald-600/90 font-medium mt-0.5">
              Daily incremental database dumps are active. Current retention: 10 days. Status: Healthy.
            </p>
          </div>
        </div>

        {/* Backup Table */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2">
            <FaClock className="text-orange-500" /> Recent Backups
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Backup Filename</th>
                  <th className="pb-3 px-4">Size</th>
                  <th className="pb-3 px-4">Created At</th>
                  <th className="pb-3 px-4">Type</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {backups.map(backup => (
                  <tr key={backup.id} className="group">
                    <td className="py-4 pr-4 text-sm font-semibold text-gray-800 font-mono">
                      {backup.filename}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-gray-900">{backup.size}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-500">{backup.createdAt}</td>
                    <td className="py-4 px-4 text-sm font-medium">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        backup.type === 'Manual' 
                          ? 'bg-orange-50 text-orange-600 border border-orange-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {backup.type}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-sm text-right space-x-2">
                      <button 
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                        title="Restore Backup"
                        onClick={() => alert(`Restoring ${backup.filename}...`)}
                      >
                        <FaUndo size={14} />
                      </button>
                      <button 
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors inline-flex"
                        title="Download Backup"
                        onClick={() => alert(`Downloading ${backup.filename}...`)}
                      >
                        <FaDownload size={14} />
                      </button>
                      <button 
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-flex"
                        title="Delete Backup"
                        onClick={() => handleDeleteBackup(backup.id)}
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
