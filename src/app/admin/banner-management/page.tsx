'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaBullhorn, FaInfoCircle, FaPlus, FaTrash } from 'react-icons/fa';

export default function BannerManagement() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [banners, setBanners] = useState([
    { id: 1, text: 'Janmashtami Celebrations will start from August 25th! Register for special pujas.', type: 'info', enabled: true },
    { id: 2, text: 'New Bhagavad Gita course starts next Sunday. Limited seats remaining.', type: 'warning', enabled: false },
    { id: 3, text: 'Temple construction updates: Watch the latest video on our video library.', type: 'success', enabled: false }
  ]);

  const [newBannerText, setNewBannerText] = useState('');
  const [newBannerType, setNewBannerType] = useState('info');

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('iskcon_admin_token');
      if (!authToken) {
        router.push('/admin/login');
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [router]);

  const handleToggle = (id: number) => {
    setBanners(prev => prev.map(banner => {
      if (banner.id === id) {
        return { ...banner, enabled: !banner.enabled };
      }
      // If we enable one, disable the others so only one is active at a time
      if (banner.id !== id && !banner.enabled) {
        return banner;
      }
      return { ...banner, enabled: false };
    }));
  };

  const handleDelete = (id: number) => {
    setBanners(prev => prev.filter(banner => banner.id !== id));
  };

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerText.trim()) return;

    setBanners(prev => [
      ...prev,
      {
        id: Date.now(),
        text: newBannerText,
        type: newBannerType,
        enabled: false
      }
    ]);
    setNewBannerText('');
    setMessage({ type: 'success', text: 'New banner template added successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Banners config saved successfully!' });
      setTimeout(() => setMessage(null), 3500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-iskcon-orange transition-colors font-medium">
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notice Banner Management</h1>
            <p className="text-gray-500 mt-1">Control active announcement headers shown at the top of the website.</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-8 flex items-start gap-3 border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <FaInfoCircle className="mt-0.5 text-lg flex-shrink-0" />
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Add Banner Template */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="p-2 bg-orange-50 text-iskcon-orange rounded-lg"><FaPlus size={14} /></span>
              Add Banner Template
            </h2>
            <form onSubmit={handleAddBanner} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notice Message Text</label>
                <textarea
                  value={newBannerText}
                  onChange={e => setNewBannerText(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition-all bg-gray-50/30 resize-none"
                  placeholder="E.g., Special worship schedules on Ekadashi day..."
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700">Banner Color Scheme:</label>
                  <select
                    value={newBannerType}
                    onChange={e => setNewBannerType(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Orange)</option>
                    <option value="success">Success (Green)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-iskcon-orange text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-700 transition"
                >
                  Create Banner
                </button>
              </div>
            </form>
          </div>

          {/* Active Banner List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="p-2 bg-red-50 text-red-500 rounded-lg"><FaBullhorn size={16} /></span>
              Notice Templates List
            </h2>
            <div className="space-y-4">
              {banners.map(banner => (
                <div 
                  key={banner.id} 
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                    banner.enabled 
                      ? 'border-orange-500 bg-orange-50/20' 
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        banner.type === 'warning' 
                          ? 'bg-orange-100 text-orange-700' 
                          : banner.type === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {banner.type}
                      </span>
                      {banner.enabled && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500 text-white animate-pulse">Active Banner</span>
                      )}
                    </div>
                    <p className="text-gray-700 font-medium text-[15px] leading-relaxed">{banner.text}</p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={banner.enabled}
                        onChange={() => handleToggle(banner.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-iskcon-orange"></div>
                    </label>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                      title="Delete Template"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <div className="text-center py-10 text-gray-400 font-medium">No notice banner templates exist.</div>
              )}
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-iskcon-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center gap-2 shadow-lg disabled:opacity-75"
              >
                {isSaving ? 'Saving...' : <><FaSave /> Save Config</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
