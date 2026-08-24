'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaFileAlt, FaPlus, FaTrash, FaEdit, FaSearch, FaInfoCircle, FaTimes, FaSpinner, FaExternalLinkAlt } from 'react-icons/fa';

interface CustomPage {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  status: 'Draft' | 'Published';
  createdAt: string;
}

export default function CustomPagesManagement() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    author: 'Temple Admin',
    status: 'Draft'
  });

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('iskcon_admin_token');
      if (!authToken) {
        router.push('/admin/login');
        return;
      }
      setIsAuthenticated(true);
      fetchPages();
    };
    checkAuth();
  }, [router]);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      if (data.success) {
        setPages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch pages', error);
      setMessage({ type: 'error', text: 'Failed to load custom pages.' });
    } finally {
      setIsLoading(false);
    }
  };

  const openModalForNew = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      author: 'Temple Admin',
      status: 'Draft'
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (page: CustomPage) => {
    setEditingId(page._id || page.id || null);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      author: page.author || 'Temple Admin',
      status: page.status || 'Draft'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('iskcon_admin_token');
      const url = editingId ? `/api/pages/${editingId}` : '/api/pages';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: editingId ? 'Page updated successfully!' : 'Page created successfully!' });
        fetchPages();
        setIsModalOpen(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save page' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom page?')) return;
    try {
      const token = localStorage.getItem('iskcon_admin_token');
      const res = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Page deleted successfully!' });
        setPages(prev => prev.filter(p => p._id !== id && p.id !== id));
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred during deletion.' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredPages = pages.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-generate slug from title if slug is empty or user is typing title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => {
      // Only auto-generate if we are creating new and haven't manually edited slug much,
      // but to keep it simple, we auto-update slug if we are creating new
      if (!editingId && (!prev.slug || prev.slug === prev.title.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/(^-|-$)+/g, ''))) {
        return {
          ...prev,
          title: newTitle,
          slug: newTitle.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/(^-|-$)+/g, '')
        };
      }
      return { ...prev, title: newTitle };
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-iskcon-orange transition-colors font-medium">
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Custom Pages</h1>
            <p className="text-gray-500 mt-1 font-medium">Create and manage standalone HTML pages on the website.</p>
          </div>
          <button
            onClick={openModalForNew}
            className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
          >
            <FaPlus /> Create New Page
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-8 flex items-start gap-3 border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <FaInfoCircle className="mt-0.5 text-lg flex-shrink-0" />
            <span className="font-bold">{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-96">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search pages by title or slug..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange bg-white transition-all text-sm font-medium shadow-sm"
              />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FaFileAlt /> {filteredPages.length} Pages Found
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-[#FF6B00]" />
              </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/30">
                    <th className="py-4 px-6">Page Title</th>
                    <th className="py-4 px-6">URL Slug</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Created At</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map(page => (
                    <tr key={page._id || page.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-800 text-[15px] truncate max-w-xs">{page.title}</td>
                      <td className="py-4 px-6 font-semibold text-gray-500 text-sm">/p/{page.slug}</td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md ${
                          page.status === 'Published' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {page.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-500 text-sm">{new Date(page.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          {page.status === 'Published' && (
                            <a
                              href={`/p/${page.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition shadow-sm border border-transparent hover:border-green-100"
                              title="View Page"
                            >
                              <FaExternalLinkAlt size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => openModalForEdit(page)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition shadow-sm border border-transparent hover:border-blue-100"
                            title="Edit Page"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(page._id || page.id as string)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition shadow-sm border border-transparent hover:border-red-100"
                            title="Delete Page"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPages.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="inline-flex flex-col items-center justify-center text-gray-400">
                           <FaFileAlt className="text-5xl mb-4 text-gray-200" />
                           <p className="font-medium text-lg">No custom pages found.</p>
                           <p className="text-sm">Click &quot;Create New Page&quot; to add one.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <FaEdit className="text-[#FF6B00]" /> {editingId ? 'Edit Custom Page' : 'Create Custom Page'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors">
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
                <form id="pageForm" onSubmit={handleSave} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Page Title</label>
                      <input 
                        type="text" required 
                        placeholder="e.g. History of Our Temple"
                        value={formData.title} onChange={handleTitleChange}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00] outline-none transition font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-gray-400 font-semibold bg-gray-100 px-2 py-1 rounded">/p/</span>
                        <input 
                          type="text" required 
                          placeholder="history-of-our-temple"
                          value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '')})}
                          className="w-full pl-16 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00] outline-none transition font-medium"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-1 font-medium">Use only lowercase letters, numbers, and hyphens.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">HTML Content</label>
                    <textarea 
                      required rows={12}
                      placeholder="<div class='container'>&#10;  <h1>Welcome</h1>&#10;  <p>Write your custom HTML code here...</p>&#10;</div>"
                      value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-900 text-gray-100 border border-gray-800 rounded-xl focus:ring-2 focus:ring-[#FF6B00] outline-none transition font-mono text-sm custom-scrollbar resize-y min-h-[300px]"
                      spellCheck="false"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Author</label>
                      <input 
                        type="text" required 
                        value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00] outline-none transition font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                      <select 
                        value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00] outline-none transition font-medium appearance-none"
                      >
                        <option value="Draft">Draft (Hidden)</option>
                        <option value="Published">Published (Live)</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  form="pageForm"
                  type="submit" disabled={isSubmitting}
                  className="bg-[#FF6B00] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
                >
                  {isSubmitting ? <><FaSpinner className="animate-spin" /> Saving...</> : 'Save Page'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
