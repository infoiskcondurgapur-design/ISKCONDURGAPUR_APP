'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaYoutube, FaRedo, FaExternalLinkAlt } from 'react-icons/fa';

interface VideoEntry {
  videoId: string;
  title: string;
  published: string;
  thumbnail: string;
  description: string;
}

export default function VideoLibraryAdminPage() {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/youtube-videos', { cache: 'no-store' });
      const result = await res.json();
      if (res.ok) {
        const list = Array.isArray(result) ? result : result.videos || result.data || [];
        setVideos(list);
      } else {
        setError(result.error || 'Failed to load videos from the temple YouTube channel');
      }
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadVideos(); }, [loadVideos]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
              Video <span className="text-[#FF6B00]">Library</span>
            </h1>
            <p className="text-gray-500 font-medium flex flex-wrap items-center gap-x-2">
              Live from the official channel
              <a href="https://www.youtube.com/@iskcondurgapurofficial" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 font-bold">
                @ISKCON Durgapur <FaExternalLinkAlt size={10} />
              </a>
              — manage uploads in YouTube Studio.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadVideos} disabled={isLoading} className="px-5 py-3 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-all">
              <FaRedo size={13} /> Refresh
            </button>
            <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer" className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
              <FaYoutube size={16} /> YouTube Studio
            </a>
          </div>
        </div>

        {error && <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm font-semibold">{error}</div>}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="aspect-video bg-gray-100"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {videos.map(video => (
              <a
                key={video.videoId}
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={video.thumbnail} alt={video.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <FaYoutube className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" size={40} />
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">{video.title}</h4>
                  <p className="text-xs text-gray-400 font-medium mt-2">{new Date(video.published).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </a>
            ))}
          </motion.div>
        ) : (
          !error && (
            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
              <FaYoutube className="mx-auto text-gray-200 mb-4" size={48} />
              <h3 className="font-bold text-gray-800 mb-1">No videos found</h3>
              <p className="text-sm text-gray-500">The channel may have no public uploads yet.</p>
            </div>
          )
        )}

      </div>
    </div>
  );
}
