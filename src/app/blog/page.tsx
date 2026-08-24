'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaCalendarAlt, FaUser, FaTag, FaArrowRight } from 'react-icons/fa';

interface BlogArticle {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  coverImage?: string;
  author: string;
  createdAt: string;
}

const CATEGORIES = [
  'All',
  'Vedic Philosophy',
  'Festivals',
  'News & Announcements',
  'Spiritual Practice',
  'Outreach & Community'
];

export default function BlogList() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<BlogArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/blog?status=Published');
        const result = await response.json();
        if (response.ok) {
          setArticles(result.data || []);
          setFilteredArticles(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    let result = articles;

    if (selectedCategory !== 'All') {
      result = result.filter(a => a.category === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      result = result.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredArticles(result);
  }, [selectedCategory, searchQuery, articles]);

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <main className="min-h-screen bg-[#F3D4A5] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#FF6B00]/5 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">
            Spiritual <span className="text-[#FF6B00]">Blog & News</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed font-medium">
            Explore transcendental teachings, read updates on festivals, learn Vedic philosophies, and stay connected with temple kirtans and announcements.
          </p>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 border-b border-gray-100 pb-8">
          {/* Categories Tab */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20'
                    : 'bg-white text-gray-500 hover:bg-orange-50/50 hover:text-[#FF6B00] border border-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Grid List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
            <p className="text-gray-400 font-semibold text-sm">Loading articles...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredArticles.map(article => (
                <motion.article
                  layout
                  key={article._id || article.slug}
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl border border-gray-100/70 overflow-hidden shadow-sm hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col group h-full"
                >
                  {/* Card Cover Image */}
                  <div className="relative h-56 w-full bg-gradient-to-br from-orange-100 to-amber-200 overflow-hidden">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-400 via-[#FF6B00] to-amber-500 opacity-90">
                        <span className="text-7xl">≡ƒ¬ö</span>
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-[#FF6B00] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                      <FaTag className="text-[10px]" /> {article.category}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col">
                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <FaCalendarAlt /> {new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FaUser /> {article.author}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#FF6B00] transition-colors mb-3 line-clamp-2 leading-snug">
                      <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                    </h2>

                    <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium line-clamp-3">
                      {article.summary}
                    </p>

                    {/* CTA Link */}
                    <div className="mt-auto pt-4 border-t border-gray-50">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#FF6B00] group-hover:gap-3 transition-all duration-300"
                      >
                        Read Full Article <FaArrowRight />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!isLoading && filteredArticles.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-50 shadow-sm max-w-xl mx-auto">
            <span className="text-5xl mb-4 block">≡ƒòë∩╕Å</span>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No articles found</h3>
            <p className="text-gray-400 text-sm font-medium">Try searching for other topics or select another category filter.</p>
          </div>
        )}
      </div>
    </main>
  );
}
