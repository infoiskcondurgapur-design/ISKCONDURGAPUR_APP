'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaVideo, FaPlus, FaTrash, FaEdit, FaSearch, FaInfoCircle, FaExternalLinkAlt } from 'react-icons/fa';

export default function VideoLibraryManagement() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [videos, setVideos] = useState([
    { id: 1, title: 'Janmashtami 2025 Maha Abhishek Darshan', youtubeId: 'ysz7vP73Nis', category: 'Festivals', featured: true },
    { id: 2, title: 'Lecture on Bhagavad Gita Ch. 4 Text 1-5', youtubeId: '2b_2_2x99a', category: 'Lectures', featured: false },
    { id: 3, title: 'Sweet Harinam Sankirtan in Durgapur City', youtubeId: 'd9b3i9u-sa', category: 'Kirtans', featured: false }
  ]);

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

  const handleDelete = (id: number) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    setMessage({ type: 'success', text: 'Video link deleted successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-iskcon-orange transition-colors font-medium">
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Library</h1>
            <p className="text-gray-500 mt-1">Manage YouTube videos, streams, and discourses displayed in the public media section.</p>
          </div>
          <button
            onClick={() => alert('New video layout - Local Simulation')}
            className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center gap-2 self-start md:self-center"
          >
            <FaPlus /> Embed Video
          </button>
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos by title or category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange bg-white transition-all text-sm font-medium"
              />
            </div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FaVideo /> {filteredVideos.length} Videos Loaded
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/30">
                  <th className="py-4 px-6">Video Title</th>
                  <th className="py-4 px-6">YouTube Video ID</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Featured</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map(video => (
                  <tr key={video.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-800 text-[15px]">{video.title}</td>
                    <td className="py-4 px-6 font-mono text-gray-500 text-sm">
                      <a 
                        href={`https://youtube.com/watch?v=${video.youtubeId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-500 hover:underline"
                      >
                        {video.youtubeId} <FaExternalLinkAlt size={10} />
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-orange-50 text-iskcon-orange">
                        {video.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                        video.featured 
                          ? 'bg-amber-500 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}>
                        {video.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => alert(`Edit simulated for: ${video.title}`)}
                          className="p-2 text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 rounded-xl transition"
                          title="Edit Video"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                          title="Delete Video"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredVideos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">No videos found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
