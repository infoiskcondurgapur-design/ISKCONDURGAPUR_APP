'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  FaEnvelopeOpen,
  FaEnvelope,
  FaSearch,
  FaFilter,
  FaQuoteLeft,
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ΓöÇΓöÇΓöÇ Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

interface Letter {
  id: string | number;
  title: string;
  recipient: string;
  date: string;
  location: string;
  category: string;
  body: string;
}

interface ApiResponse {
  letters: Letter[];
  categories: string[];
  total: number;
  page: number;
  totalPages: number;
}

// ΓöÇΓöÇΓöÇ Constants ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const LIMIT = 20;

// ΓöÇΓöÇΓöÇ Sub-components ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="text-amber-400 text-5xl"
      >
        <FaSpinner />
      </motion.div>
      <p className="text-amber-300/70 text-sm tracking-widest uppercase">
        Loading lettersΓÇª
      </p>
    </div>
  );
}

function EmptyState({ search, category }: { search: string; category: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-32 gap-6 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <FaEnvelope className="text-4xl text-amber-400/50" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-amber-200 mb-2">No letters found</h3>
        <p className="text-amber-300/60 text-sm max-w-sm">
          {search || category
            ? 'Try adjusting your search or clearing the filters.'
            : 'No letters are available at the moment.'}
        </p>
      </div>
    </motion.div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 capitalize">
      {category}
    </span>
  );
}

function LetterCard({ letter, index }: { letter: Letter; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl overflow-hidden border border-amber-500/20 bg-gradient-to-b from-[#1a1200]/80 to-[#0d0900]/80 backdrop-blur-sm shadow-lg shadow-black/30 hover:border-amber-500/40 transition-colors duration-300"
    >
      {/* ΓöÇΓöÇ Card Header ΓöÇΓöÇ */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-left"
        aria-expanded={expanded}
      >
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-900/60 via-orange-900/40 to-amber-900/60 border-b border-amber-500/20">
          {/* Subtle glow strip */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <FaEnvelopeOpen className="text-amber-400 text-sm" />
              </div>
              <h3 className="text-base font-semibold text-amber-100 leading-snug">
                {letter.title}
              </h3>
            </div>
            <div className="flex-shrink-0 mt-0.5 text-amber-400/70">
              {expanded ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 pl-12">
            {letter.recipient && (
              <span className="flex items-center gap-1.5 text-xs text-amber-300/70">
                <FaUser className="text-amber-500/70 text-[10px]" />
                {letter.recipient}
              </span>
            )}
            {letter.date && (
              <span className="flex items-center gap-1.5 text-xs text-amber-300/70">
                <FaCalendarAlt className="text-amber-500/70 text-[10px]" />
                {letter.date}
              </span>
            )}
            {letter.location && (
              <span className="flex items-center gap-1.5 text-xs text-amber-300/70">
                <FaMapMarkerAlt className="text-amber-500/70 text-[10px]" />
                {letter.location}
              </span>
            )}
            {letter.category && (
              <CategoryBadge category={letter.category} />
            )}
          </div>
        </div>
      </button>

      {/* ΓöÇΓöÇ Expandable Body ΓöÇΓöÇ */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 py-5">
              <div className="flex gap-3">
                <FaQuoteLeft className="text-amber-500/30 text-2xl flex-shrink-0 mt-1" />
                <pre className="font-serif text-sm text-amber-100/80 leading-relaxed whitespace-pre-wrap break-words flex-1">
                  {letter.body}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ΓöÇΓöÇΓöÇ Main Page ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export default function LettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ΓöÇΓöÇ Debounce search ΓöÇΓöÇ
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 400);
  }, []);

  // ΓöÇΓöÇ Fetch letters ΓöÇΓöÇ
  const fetchLetters = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(LIMIT),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (category) params.set('category', category);

      const res = await fetch(`/api/prabhupada/letters?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: ApiResponse = await res.json();

      setLetters(data.letters ?? []);
      setCategories(data.categories ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error('Error fetching letters:', err);
      setLetters([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, category]);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  // Reset page when category changes
  const handleCategoryChange = useCallback((cat: string) => {
    setCategory(cat);
    setCurrentPage(1);
  }, []);

  const allCategories = useMemo(() => ['All', ...categories], [categories]);

  // ΓöÇΓöÇ Pagination helpers ΓöÇΓöÇ
  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-[#0a0700] text-white">

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
          HERO SECTION
      ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <section className="relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-orange-950 to-[#0a0700]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(234,88,12,0.12),transparent_60%)]" />

        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(245,158,11,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.5) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top glow strip */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm text-amber-300 text-xs tracking-widest uppercase mb-8"
          >
            <FaEnvelope className="text-amber-400" />
            Correspondence Archive
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400">
              Letters of
            </span>
            <br />
            <span className="text-white">┼Ür─½la Prabhup─üda</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-amber-200/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Thousands of personal letters revealing the heart, wisdom, and
            transcendental guidance of His Divine Grace A.C. Bhaktivedanta
            Swami Prabhup─üda.
          </motion.p>

          {/* Stats pill */}
          {!loading && total > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm"
            >
              <FaEnvelopeOpen className="text-amber-400" />
              <span>
                <strong className="text-amber-200">{total.toLocaleString()}</strong> letters in the archive
              </span>
            </motion.div>
          )}
        </div>

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0700] to-transparent" />
      </section>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
          STICKY SEARCH + FILTERS
      ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <div className="sticky top-0 z-30 bg-[#0a0700]/90 backdrop-blur-lg border-b border-amber-500/10 shadow-lg shadow-black/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">

          {/* Search bar */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/60 text-sm pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search letters by title, recipient, or contentΓÇª"
              className="w-full bg-amber-950/30 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-amber-100 placeholder:text-amber-400/40 focus:outline-none focus:border-amber-500/60 focus:bg-amber-950/50 transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/50 hover:text-amber-300 text-xs transition-colors"
              >
                Γ£ò
              </button>
            )}
          </div>

          {/* Category filter pills */}
          {allCategories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <FaFilter className="text-amber-500/50 text-xs flex-shrink-0" />
              {allCategories.map((cat) => {
                const isActive = cat === 'All' ? category === '' : category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat === 'All' ? '' : cat)}
                    className={`flex-shrink-0 px-3.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 capitalize ${
                      isActive
                        ? 'bg-amber-500 border-amber-400 text-black shadow-md shadow-amber-500/30'
                        : 'bg-amber-950/30 border-amber-500/20 text-amber-300/70 hover:border-amber-500/50 hover:text-amber-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
          MAIN CONTENT
      ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {loading ? (
          <LoadingSpinner />
        ) : letters.length === 0 ? (
          <EmptyState search={debouncedSearch} category={category} />
        ) : (
          <>
            {/* Result count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-amber-300/50 text-sm">
                Showing{' '}
                <span className="text-amber-300">
                  {(currentPage - 1) * LIMIT + 1}ΓÇô{Math.min(currentPage * LIMIT, total)}
                </span>{' '}
                of <span className="text-amber-300">{total.toLocaleString()}</span> letters
              </p>
              {(debouncedSearch || category) && (
                <button
                  onClick={() => {
                    handleSearchChange('');
                    handleCategoryChange('');
                  }}
                  className="text-xs text-amber-400/60 hover:text-amber-300 underline underline-offset-2 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Letter cards */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {letters.map((letter, i) => (
                  <LetterCard key={letter.id} letter={letter} index={i} />
                ))}
              </AnimatePresence>
            </div>

            {/* ΓöÇΓöÇ Pagination ΓöÇΓöÇ */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-500/20 bg-amber-950/30 text-amber-300 text-sm font-medium hover:border-amber-500/50 hover:bg-amber-950/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <FaChevronLeft className="text-xs" />
                  Previous
                </button>

                <div className="px-5 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm font-medium select-none">
                  Page <span className="text-amber-400 font-bold">{currentPage}</span> of{' '}
                  <span className="text-amber-400 font-bold">{totalPages}</span>
                </div>

                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-500/20 bg-amber-950/30 text-amber-300 text-sm font-medium hover:border-amber-500/50 hover:bg-amber-950/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
          FOOTER ACCENT
      ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <div className="relative mt-16 py-8 border-t border-amber-500/10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-400/30 text-xs tracking-widest uppercase">
            All letters ┬⌐ The Bhaktivedanta Book Trust International
          </p>
        </div>
      </div>
    </div>
  );
}
