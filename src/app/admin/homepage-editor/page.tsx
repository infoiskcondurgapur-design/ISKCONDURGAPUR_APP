'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaHome, FaInfoCircle, FaImage } from 'react-icons/fa';

export default function HomepageEditor() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [homepageData, setHomepageData] = useState({
    heroTitle: 'ISKCON Durgapur',
    heroSubtitle: 'Chant Hare Krishna & Be Happy',
    heroCtaText: 'Explore Events',
    heroCtaLink: '/events',
    missionTitle: 'Our Mission',
    missionText: 'To systematically propagate spiritual knowledge to society at large and to educate all people in the techniques of spiritual life in order to achieve real unity and peace in the world.',
    welcomeMessage: 'Welcome to Sri Sri Radha Madhava Mandir, Durgapur. Join us for daily darshan, kirtan, and classes.'
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHomepageData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Homepage settings updated successfully (local simulation)!' });
      setTimeout(() => setMessage(null), 4000);
    }, 1200);
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
            <h1 className="text-3xl font-bold text-gray-900">Homepage Editor</h1>
            <p className="text-gray-500 mt-1">Configure layout, titles, subtitles, and descriptions on the website front page.</p>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hero Section Banner */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="p-2 bg-orange-50 text-iskcon-orange rounded-lg"><FaHome size={16} /></span>
              Hero Welcome Banner
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Main Welcome Title</label>
                <input
                  type="text"
                  name="heroTitle"
                  value={homepageData.heroTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition-all bg-gray-50/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle / Tagline</label>
                <input
                  type="text"
                  name="heroSubtitle"
                  value={homepageData.heroSubtitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition-all bg-gray-50/30"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CTA Button Label</label>
                  <input
                    type="text"
                    name="heroCtaText"
                    value={homepageData.heroCtaText}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition-all bg-gray-50/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CTA Button Route / Target</label>
                  <input
                    type="text"
                    name="heroCtaLink"
                    value={homepageData.heroCtaLink}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition-all bg-gray-50/30"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Welcome Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="p-2 bg-purple-50 text-purple-500 rounded-lg"><FaImage size={16} /></span>
              Homepage Body Content
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Welcome Introduction</label>
                <textarea
                  name="welcomeMessage"
                  value={homepageData.welcomeMessage}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition-all bg-gray-50/30 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mission Title</label>
                <input
                  type="text"
                  name="missionTitle"
                  value={homepageData.missionTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition-all bg-gray-50/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mission Description</label>
                <textarea
                  name="missionText"
                  value={homepageData.missionText}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition-all bg-gray-50/30 resize-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/admin" className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-semibold">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-iskcon-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center gap-2 shadow-lg"
            >
              {isSaving ? 'Saving...' : <><FaSave /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
