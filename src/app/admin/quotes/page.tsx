'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaQuoteLeft, FaRedo } from 'react-icons/fa';

interface QuoteItem {
  _id: string;
  text: string;
  source: string;
}

const EMPTY_FORM = { text: '', source: '' };

export default function QuotesAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState<QuoteItem[]>([]);
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
    loadQuotes();
  }, [router]);

  const loadQuotes = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/quotes', { headers: authHeaders() });
      const result = await res.json();
      if (res.ok && result.data) setItems(result.data);
      else setError(result.message || result.error || 'Failed to load quotes');
    } catch (err) {
      console.error('Error loading quotes:', err);
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim() || !form.source.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/quotes', { method: 'POST', headers: authHeaders(), body: JSON.stringify(form) });
      const result = await res.json();
      if (res.ok) {
        setForm({ ...EMPTY_FORM });
        loadQuotes();
      } else if (res.status === 401) router.push('/admin/login');
      else alert(result.message || result.error || 'Failed to add quote');
    } catch (err) {
      console.error('Error adding quote:', err);
      alert('Failed to add quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quote?')) return;
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) setItems(prev => prev.filter(i => i._id !== id));
      else alert('Failed to delete quote');
    } catch (err) {
      console.error('Error deleting quote:', err);
      alert('Failed to delete quote');
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
              Daily <span className="text-[#FF6B00]">Quotes</span>
            </h1>
            <p className="text-gray-500 font-medium">Spiritual quotes shown across the website.</p>
          </div>
          <button onClick={loadQuotes} className="px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-all">
            <FaRedo size={13} /> Refresh
          </button>
        </div>

        {error && <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm font-semibold">{error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleCreate} className="xl:col-span-1 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 h-fit space-y-4">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2"><FaPlus className="text-orange-500" size={16} /> Add Quote</h3>
            <textarea required rows={5} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Quote text * " className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm font-medium resize-y" />
            <input required value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="Source (e.g. Bhagavad-gita 2.47) *" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm font-medium" />
            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <FaPlus size={13} /> {isSubmitting ? 'Adding...' : 'Add Quote'}
            </button>
          </motion.form>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
            {items.length > 0 ? (
              items.map(item => (
                <div key={item._id} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 group relative">
                  <FaQuoteLeft className="text-orange-100 mb-4 group-hover:text-orange-200 transition-colors" size={24} />
                  <p className="text-gray-800 font-medium leading-relaxed mb-4">{item.text}</p>
                  <p className="text-sm font-black text-orange-600 uppercase tracking-wide">— {item.source}</p>
                  <button onClick={() => handleDelete(item._id)} aria-label="Delete quote" className="absolute top-4 right-4 p-2.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                    <FaTrash size={13} />
                  </button>
                </div>
              ))
            ) : (
              !isLoading && (
                <div className="md:col-span-2 bg-white rounded-3xl p-12 text-center text-gray-500 font-medium border border-gray-100">
                  No quotes yet — add your first using the form.
                </div>
              )
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
