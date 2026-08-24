'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaBullhorn, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function BannerManagementPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    loadSettings();
  }, [router]);

  const loadSettings = useCallback(async () => {
    try {
      setMessage(null);
      const res = await fetch('/api/settings');
      const result = await res.json();
      if (res.ok && result.data) {
        setEnabled(!!result.data.noticeBannerEnabled);
        setText(result.data.noticeBannerText || '');
        setOriginalText(result.data.noticeBannerText || '');
      } else {
        setMessage({ type: 'error', text: result.message || result.error || 'Failed to load banner settings' });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setMessage({ type: 'error', text: 'Failed to connect to the server' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enabled && !text.trim()) {
      setMessage({ type: 'error', text: 'Please enter the banner message before enabling it.' });
      return;
    }
    try {
      setIsSaving(true);
      const res = await fetch('/api/settings', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ noticeBannerEnabled: enabled, noticeBannerText: text.trim() }) });
      const result = await res.json();
      if (res.ok) {
        setOriginalText(text.trim());
        setMessage({ type: 'success', text: 'Banner saved. Visitors will see it on their next page view.' });
      } else if (res.status === 401) router.push('/admin/login');
      else setMessage({ type: 'error', text: result.message || result.error || 'Failed to save banner' });
    } catch (err) {
      console.error('Error saving banner:', err);
      setMessage({ type: 'error', text: 'Failed to save banner' });
    } finally {
      setIsSaving(false);
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
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
            Notice <span className="text-[#FF6B00]">Banner</span>
          </h1>
          <p className="text-gray-500 font-medium">The floating announcement card shown on every public page.</p>
        </div>

        {message && (
          <div className={`mb-8 rounded-2xl p-4 text-sm font-semibold border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            {message.text}
          </div>
        )}

        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSave} className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 space-y-6">

          <label className={`flex justify-between items-center gap-4 p-5 rounded-2xl cursor-pointer transition-colors ${enabled ? 'bg-orange-50/60 border border-orange-200' : 'bg-gray-50 border border-gray-200 hover:border-orange-200'}`}>
            <span>
              <span className="block font-bold text-gray-900 flex items-center gap-2">
                {enabled ? <FaBullhorn className="text-orange-500 animate-pulse" /> : <FaEyeSlash className="text-gray-400" />}
                {enabled ? 'Banner is LIVE on the website' : 'Banner is currently hidden'}
              </span>
              <span className="block text-sm text-gray-500 mt-1">Visitors can dismiss it; it stays hidden for them until the message changes.</span>
            </span>
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="sr-only peer" />
            <span className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 after:absolute after:top-1 after:left-1 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-transform ${enabled ? 'bg-gradient-to-r from-orange-500 to-amber-500 after:translate-x-5' : 'bg-gray-300'}`}></span>
          </label>

          <div>
            <label htmlFor="notice-text" className="block font-bold text-gray-800 mb-2">Banner Message</label>
            <textarea
              id="notice-text"
              rows={4}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="e.g. Sunday Love Feast every week at 6 PM — all are welcome!"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm font-medium resize-y"
            />
            <p className="text-xs text-gray-400 mt-2">{text.length} characters — keep it short and welcoming.</p>
          </div>

          <button
            type="submit"
            disabled={isSaving || (enabled === !!originalText && text === originalText && enabled === false)}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <FaSave size={14} /> {isSaving ? 'Saving...' : 'Save Banner'}
          </button>

        </motion.form>

        {enabled && text.trim() && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <p className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2"><FaEye /> Live Preview</p>
            <div className="bg-white border-l-4 border-[#FF6B00] p-4 rounded-2xl shadow-xl max-w-sm w-full flex gap-3 items-start">
              <div className="bg-orange-50 text-[#FF6B00] p-2.5 rounded-xl flex-shrink-0 mt-0.5"><FaBullhorn className="animate-bounce" /></div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1 tracking-wide">Announcement</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
