'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaBookOpen, FaRedo } from 'react-icons/fa';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  author: string;
  status: 'Draft' | 'Published';
}

const EMPTY_FORM = { title: '', summary: '', content: '', category: 'Philosophy', author: 'Temple Admin', status: 'Published' as 'Draft' | 'Published' };

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80);

export default function BlogAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
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
    loadPosts();
  }, [router]);

  const loadPosts = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/blog', { headers: authHeaders() });
      const result = await res.json();
      if (res.ok && result.data) setPosts(Array.isArray(result.data) ? result.data : result.data.posts || []);
      else setError(result.message || result.error || 'Failed to load posts');
    } catch (err) {
      console.error('Error loading blog posts:', err);
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    const payload = { ...form, slug: slugify(form.title) };
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/blog', { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      const result = await res.json();
      if (res.ok || res.status === 201) {
        setForm({ ...EMPTY_FORM });
        loadPosts();
      } else if (res.status === 401) router.push('/admin/login');
      else alert(result.message || result.error || 'Failed to create post');
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) setPosts(prev => prev.filter(p => p._id !== id));
      else alert('Failed to delete post');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
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
              Vedic <span className="text-[#FF6B00]">Blog</span>
            </h1>
            <p className="text-gray-500 font-medium">Articles published at /blog on the public website.</p>
          </div>
          <button onClick={loadPosts} className="px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-all">
            <FaRedo size={13} /> Refresh
          </button>
        </div>

        {error && <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm font-semibold">{error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleCreate} className="xl:col-span-1 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 h-fit space-y-4">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2"><FaPlus className="text-orange-500" size={16} /> New Article</h3>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title *" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm font-medium" />
            {form.title && <p className="text-xs text-gray-400 font-mono px-1 -mt-2 truncate">slug: /blog/{slugify(form.title)}</p>}
            <input required value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Short summary *" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm font-medium" />
            <textarea required rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Article content * " className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm font-medium resize-y font-mono" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Category" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm font-medium" />
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'Draft' | 'Published' }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm font-medium bg-white">
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <FaPlus size={13} /> {isSubmitting ? 'Publishing...' : 'Publish Article'}
            </button>
          </motion.form>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2"><FaBookOpen className="text-orange-500" /> All Articles ({posts.length})</h3>
            {posts.length > 0 ? (
              <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {posts.map(post => (
                  <li key={post._id} className="border border-gray-100 rounded-2xl p-4 hover:border-orange-200 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${post.status === 'Published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{post.status}</span>
                          {post.category && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">{post.category}</span>}
                        </div>
                        <h4 className="font-bold text-gray-900 truncate">{post.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{post.summary}</p>
                        <code className="text-xs text-gray-400 font-mono">/blog/{post.slug}</code>
                      </div>
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex-shrink-0 mt-1 mr-1">View</a>
                      <button onClick={() => handleDelete(post._id, post.title)} aria-label={`Delete ${post.title}`} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-60 group-hover:opacity-100 transition-all flex-shrink-0">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 text-gray-500 font-medium">No articles yet — publish your first one.</div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
