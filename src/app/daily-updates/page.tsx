'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaSearch } from 'react-icons/fa';

interface DailyUpdate {
    _id: string;
    date: string;
    title: string;
    message: string;
    images: string[];
}

export default function DailyUpdatesArchive() {
    const [updates, setUpdates] = useState<DailyUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const res = await fetch('/api/daily-updates');
                const result = await res.json();
                if (res.ok && result.data) {
                    const published = result.data.filter((item: any) => item.status === 'Published');
                    setUpdates(published);
                }
            } catch (err) {
                console.error('Error fetching updates:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUpdates();
    }, []);

    const filteredUpdates = updates.filter((item) => {
        const dateStr = new Date(item.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).toLowerCase();
        return (
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.date.includes(searchQuery) ||
            dateStr.includes(searchQuery.toLowerCase())
        );
    });

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Simple Header */}
                <div className="mb-12 text-center sm:text-left">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Daily Temple Updates</h1>
                    <p className="text-gray-500 mt-2 font-medium">Browse daily darshan images and spiritual thoughts from the temple.</p>
                </div>

                {/* Simple Search bar */}
                <div className="mb-12 max-w-md">
                    <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 flex items-center px-4 py-2.5">
                        <FaSearch className="text-gray-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Search by date (e.g. 2026-06) or title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none focus:outline-none text-gray-700 font-medium placeholder-gray-400 text-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {filteredUpdates.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center text-gray-500 max-w-md mx-auto shadow-sm">
                                <p className="font-bold text-gray-800 mb-1">No updates found</p>
                                <p className="text-sm text-gray-500">Try searching for a different date.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredUpdates.map((item, idx) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.2) }}
                                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
                                    >
                                        {/* Image / Fallback */}
                                        <div className="relative aspect-[16/10] bg-gradient-to-br from-orange-400 to-amber-600 overflow-hidden flex items-center justify-center">
                                            {item.images && item.images.length > 0 ? (
                                                <Image
                                                    src={item.images[0]}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 text-white select-none">
                                                    <span className="font-sanskrit text-2xl font-black tracking-tight drop-shadow-md">ISKCON</span>
                                                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase drop-shadow-sm opacity-80 -mt-1">Durgapur</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 mb-2">
                                                <FaCalendarAlt />
                                                <span>{formatDate(item.date)}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                                                {item.message}
                                            </p>
                                            
                                            <div className="border-t border-gray-50 pt-4 flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-400">
                                                    {item.images && item.images.length > 0 
                                                        ? `${item.images.length} ${item.images.length === 1 ? 'image' : 'images'}`
                                                        : 'Daily Update'}
                                                </span>
                                                <Link
                                                    href={`/daily-updates/${item.date}`}
                                                    className="text-sm font-bold text-orange-500 hover:text-orange-600 hover:underline"
                                                >
                                                    Read Update ΓåÆ
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
