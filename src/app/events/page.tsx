'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaSearch, FaSpinner, FaSyncAlt } from 'react-icons/fa';
import { getEvents, ApiEvent } from '@/lib/api';

const CATEGORY_OPTIONS = ['All', 'Festival', 'Weekly Program', 'Special Event', 'Cultural', 'Education'];

export default function EventsPage() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { per_page: '50' };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (upcomingOnly) params.upcoming = 'true';
      const res = await getEvents(params);
      setEvents(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [search, category, upcomingOnly]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const featured = events.filter(e => e.isFeatured);
  const all = events;

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <main className="min-h-screen bg-amber-50">
      {/* Hero */}
      <section className="relative py-16 pt-28 flex items-center justify-center text-white bg-gradient-to-br from-orange-700 via-orange-600 to-amber-500">
        <div className="z-10 container mx-auto px-4 text-center">
          <motion.h1 className="text-5xl md:text-6xl font-bold mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Events &amp; Festivals
          </motion.h1>
          <motion.p className="text-xl md:text-2xl max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            Join us in celebration of Krishna consciousness through various spiritual and cultural events
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={upcomingOnly} onChange={e => setUpcomingOnly(e.target.checked)} className="accent-orange-500" />
            Upcoming only
          </label>
          <span className="text-xs text-gray-400">{events.length} events</span>
          <button onClick={fetchEvents} className="p-2 text-orange-500 hover:text-orange-700" title="Refresh">
            <FaSyncAlt />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <FaSpinner className="animate-spin text-orange-500 text-4xl" />
            <span className="ml-4 text-gray-500 text-lg">Loading events from database…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="max-w-lg mx-auto text-center py-16">
            <p className="text-red-500 font-semibold mb-2">{error}</p>
            <p className="text-sm text-gray-500 mb-6">Make sure the Laravel backend is running on port 8080.</p>
            <button onClick={fetchEvents} className="bg-orange-500 text-white px-6 py-2 rounded-lg">Retry</button>
          </div>
        )}

        {/* No results */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-24">
            <p className="text-2xl text-gray-400 mb-4">No events found</p>
            <p className="text-gray-500 text-sm">Add events via the admin panel or adjust your filters.</p>
          </div>
        )}

        {/* Featured Events */}
        {!loading && !error && featured.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-orange-700 mb-6">⭐ Featured Events</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featured.map(event => (
                <motion.div key={event._id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow" whileHover={{ y: -4 }}>
                  <div className="relative h-56">
                    <Image src={(event.image && event.image.replace(/\\/g, '/')) || '/images/iskcon-logo.png'} alt={event.title} fill className="object-cover" />
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Featured</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1"><FaCalendarAlt className="text-orange-500" />{formatDate(event.date)}</span>
                      {event.time && <span className="flex items-center gap-1"><FaClock className="text-orange-500" />{event.time}</span>}
                      {event.location && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-orange-500" />{event.location}</span>}
                    </div>
                    <Link href={`/events/${event._id}`} className="inline-block bg-orange-500 text-white px-5 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors">
                      Learn More →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* All Events Grid */}
        {!loading && !error && all.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-orange-700 mb-6">All Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {all.map((event, i) => (
                <motion.div key={event._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                  <div className="relative h-44">
                    <Image src={(event.image && event.image.replace(/\\/g, '/')) || '/images/iskcon-logo.png'} alt={event.title} fill className="object-cover" />
                    {event.category && <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">{event.category}</span>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{event.title}</h3>
                    <div className="flex flex-col gap-1 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><FaCalendarAlt className="text-orange-400" />{formatDate(event.date)}</span>
                      {event.location && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-orange-400" />{event.location}</span>}
                    </div>
                    <Link href={`/events/${event._id}`} className="text-orange-500 text-sm font-medium hover:underline">View Details →</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}