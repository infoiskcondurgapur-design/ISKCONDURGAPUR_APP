'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaTrash, FaInbox, FaRedo, FaEnvelopeOpenText } from 'react-icons/fa';

interface Submission {
  _id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  message: string;
  formSlug?: string;
  createdAt: string;
}

export default function SubmissionsAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [selected, setSelected] = useState<Submission | null>(null);

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
    loadSubmissions();
  }, [router]);

  const loadSubmissions = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/submissions', { headers: authHeaders() });
      const result = await res.json();
      if (res.ok && result.data) setSubmissions(result.data);
      else if (res.status === 401) router.push('/admin/login');
      else setError(result.message || result.error || 'Failed to load submissions');
    } catch (err) {
      console.error('Error loading submissions:', err);
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission permanently?')) return;
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s._id !== id));
        setSelected(null);
      } else alert('Failed to delete submission');
    } catch (err) {
      console.error('Error deleting submission:', err);
      alert('Failed to delete submission');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-16 h-16 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const types = ['All', ...Array.from(new Set(submissions.map(s => s.type).filter(Boolean)))];
  const filtered = typeFilter === 'All' ? submissions : submissions.filter(s => s.type === typeFilter);

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
              Form <span className="text-[#FF6B00]">Submissions</span>
            </h1>
            <p className="text-gray-500 font-medium">Messages and enquiries received through website forms.</p>
          </div>
          <button onClick={loadSubmissions} className="px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-all">
            <FaRedo size={13} /> Refresh
          </button>
        </div>

        {error && <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm font-semibold">{error}</div>}

        <div className="flex gap-2 flex-wrap mb-6">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${typeFilter === t ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}
            >
              {t} {t !== 'All' && `(${submissions.filter(s => s.type === t).length})`}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <motion.ul initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {filtered.map(sub => (
              <li key={sub._id} className={`bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border transition-colors group ${selected?._id === sub._id ? 'border-orange-300' : 'border-gray-100 hover:border-orange-200'}`}>
                <div
                  className="cursor-pointer"
                  onClick={() => setSelected(selected?._id === sub._id ? null : sub)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="bg-orange-50 text-orange-600 p-2.5 rounded-xl flex-shrink-0">
                        <FaEnvelopeOpenText size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-900">{sub.name}</h4>
                          {sub.type && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">{sub.type}</span>}
                          <span className="text-xs text-gray-400 font-medium">{new Date(sub.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">{sub.email} · {sub.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(sub._id); }}
                      aria-label="Delete submission"
                      className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-60 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                  {selected?._id === sub._id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4">{sub.message}</p>
                      <div className="mt-3 flex gap-3">
                        <a href={`mailto:${sub.email}?subject=Re: ${encodeURIComponent(sub.type || 'Your enquiry')}`} className="text-xs font-bold text-blue-600 hover:text-blue-800">Reply via Email →</a>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </motion.ul>
        ) : (
          !isLoading && (
            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
              <FaInbox className="mx-auto text-gray-200 mb-4" size={48} />
              <h3 className="font-bold text-gray-800 mb-1">No submissions yet</h3>
              <p className="text-sm text-gray-500">Enquiries from public forms will appear here.</p>
            </div>
          )
        )}

      </div>
    </div>
  );
}
