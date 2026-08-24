'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaCalendarAlt, FaRedo } from 'react-icons/fa';

interface FestivalItem {
  _id: string;
  name: string;
  date: string;
  timing: string;
  status: 'Active' | 'Upcoming' | 'Inactive';
}

const EMPTY_FORM = { name: '', date: '', timing: '', status: 'Upcoming' as FestivalItem['status'] };

export default function FestivalsAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState<FestivalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('iskcon_admin_token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    if (!localStorage.getItem('iskcon_admin_token')) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
    loadFestivals();
  }, [router]);

  const loadFestivals = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/festivals', { headers: authHeaders() });
      const result = await res.json();
      if (res.ok && result.data) setItems(Array.isArray(result.data) ? result.data : result.data.festivals || []);
      else setError(result.message || result.error || 'Failed to load festivals');
    } catch (err) {
      console.error('Error loading festivals:', err);
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date || !form.timing.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/festivals', { method: 'POST', headers: authHeaders(), body: JSON.stringify(form) });
      const result = await res.json();
      if (res.ok || res.status === 201) {
        setForm({ ...EMPTY_FORM });
        loadFestivals();
      } else if (res.status === 401) router.push('/admin/login');
      else alert(result.message || result.error || 'Failed to add festival');
    } catch (err) {
      console.error('Error adding festival:', err);
      alert('Failed to add festival');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/festivals/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) setItems(prev => prev.filter(i => i._id !== id));
      else alert('Failed to delete festival');
    } catch (err) {
      console.error('Error deleting festival:', err);
      alert('Failed to delete festival');
    }
  };

  if (!isAuthenticated) {
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
              Festival <span className="text-[#FF6B00]">Calendar</span>
            </h1>
            <p className="text-gray-500 font-medium">Manage upcoming temple festivals and their schedules.</p>
          </div>
          <button onClick={loadFestivals} className="px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-all">
            <FaRedo size={13} /> Refresh
          </button>
        </div>

        {error && <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm font-semibold">{error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleCreate} className="xl:col-span-1 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 h-fit space-y-4">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2"><FaPlus className="text-orange-500" size={16} /> Add Festival</h3>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Festival name *" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm font-medium" />
            <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm font-medium" />
            <input required value={form.timing} onChange={e => setForm(f => ({ ...f, timing: e.target.value }))} placeholder="Timing (e.g. 6:00 PM onwards) *" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm font-medium" />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as FestivalItem['status'] }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm font-medium bg-white">
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <FaPlus size={13} /> {isSubmitting ? 'Adding...' : 'Add Festival'}
            </button>
          </motion.form>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2"><FaCalendarAlt className="text-orange-500" /> All Festivals ({items.length})</h3>
            {items.length > 0 ? (
              <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {[...items]
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(item => (
                  <li key={item._id} className="border border-gray-100 rounded-2xl p-4 hover:border-orange-200 transition-colors group flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="bg-orange-50 text-orange-700 rounded-xl px-3 py-2 text-center flex-shrink-0 w-16">
                        <div className="text-lg font-black leading-none">{new Date(item.date).getDate()}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{new Date(item.date).toLocaleDateString('en-IN', { month: 'short' })}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : item.status === 'Upcoming' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{item.status}</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">{item.timing}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(item._id, item.name)} aria-label={`Delete ${item.name}`} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-60 group-hover:opacity-100 transition-all flex-shrink-0">
                      <FaTrash size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 text-gray-500 font-medium">No festivals yet — add your first one.</div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
