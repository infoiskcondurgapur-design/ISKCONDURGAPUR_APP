'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaUnlock, FaBan, FaCheckCircle, FaExclamationTriangle, FaList, FaUserShield } from 'react-icons/fa';

interface BlockedIP {
  id: string;
  ip: string;
  reason: string;
  blockedUntil: string;
}

export default function SecurityAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([
    { id: '1', ip: '185.220.101.5', reason: 'Multiple failed login attempts', blockedUntil: '2026-06-12 03:45 PM' },
    { id: '2', ip: '45.143.203.14', reason: 'Brute-force password attack', blockedUntil: '2026-06-12 11:20 AM' },
    { id: '3', ip: '109.230.122.98', reason: 'Path traversal scan pattern', blockedUntil: '2026-06-11 11:50 PM' }
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

  const handleUnblockAll = async () => {
    try {
      const response = await fetch('/api/auth/reset-ip', {
        method: 'POST'
      });
      if (response.ok) {
        setBlockedIPs([]);
        alert('All IP blocks cleared successfully.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnblockIP = (id: string, ip: string) => {
    setBlockedIPs(prev => prev.filter(b => b.id !== id));
    alert(`IP ${ip} unblocked successfully.`);
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
              Security <span className="text-[#FF6B00]">Dashboard</span>
            </h1>
            <p className="text-gray-500 font-medium">
              Monitor active lockouts, view malicious access logs, and manage firewall configurations.
            </p>
          </div>
          
          <button
            onClick={handleUnblockAll}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <FaUnlock />
            Clear All IP Blocks
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Status Box */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <FaCheckCircle size={22} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-0.5">Firewall Status</p>
              <h4 className="text-xl font-black text-gray-900">Active & Shielded</h4>
            </div>
          </div>

          {/* Blocked IP Count */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
              <FaBan size={22} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-0.5">Active Lockouts</p>
              <h4 className="text-xl font-black text-gray-900">{blockedIPs.length} Blocked IPs</h4>
            </div>
          </div>

          {/* Intrusion Rate */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <FaExclamationTriangle size={22} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-0.5">Threat Level</p>
              <h4 className="text-xl font-black text-gray-900">Low (0.02% scan rate)</h4>
            </div>
          </div>

        </div>

        {/* Lockout list */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden mb-10">
          <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2">
            <FaUserShield className="text-orange-500" /> Active Lockouts List
          </h3>
          
          <div className="overflow-x-auto">
            {blockedIPs.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Blocked IP Address</th>
                    <th className="pb-3 px-4">Violation Reason</th>
                    <th className="pb-3 px-4">Expires At</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {blockedIPs.map(block => (
                    <tr key={block.id} className="group">
                      <td className="py-4 pr-4 text-sm font-semibold text-gray-800 font-mono">
                        {block.ip}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-500">{block.reason}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-500">{block.blockedUntil}</td>
                      <td className="py-4 pl-4 text-sm text-right">
                        <button 
                          onClick={() => handleUnblockIP(block.id, block.ip)}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5"
                          title="Unblock IP"
                        >
                          <FaUnlock size={12} /> Unblock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500 font-medium">
                No active IP lockouts right now.
              </div>
            )}
          </div>
        </div>

        {/* Security Logs */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2">
            <FaList className="text-orange-500" /> Security Logs
          </h3>
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[#FF6B00] font-bold">[INFO]</span> 2026-06-11 14:15:22 - Successful login by user &quot;admin&quot; from IP ::1
            </div>
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/30">
              <span className="text-amber-600 font-bold">[WARN]</span> 2026-06-11 11:20:14 - rate limit hit for login endpoint at IP 45.143.203.14 (brute force detected)
            </div>
            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100/30">
              <span className="text-rose-500 font-bold">[ERR]</span> 2026-06-11 08:34:52 - blocked access attempt to sensitive path /etc/passwd from IP 109.230.122.98
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
