'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaCalendarAlt, FaQuoteLeft, FaYoutube, FaLink } from 'react-icons/fa';

interface DailyUpdate {
    _id: string;
    date: string;
    title: string;
    message: string;
    images: string[];
    youtubeVideoId?: string;
}

export default function DailyUpdateDetailClient({ update }: { update: DailyUpdate }) {
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        if (typeof window === 'undefined') return;
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 pt-32">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/daily-updates" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors font-semibold">
                        <FaArrowLeft /> Back to Daily Updates
                    </Link>
                </div>

                {/* Title & Metadata */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-orange-600 font-bold text-sm mb-3">
                        <FaCalendarAlt />
                        <span>{formatDate(update.date)}</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                        {update.title}
                    </h1>
                </div>

                {update.images && update.images.length > 0 ? (
                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        
                        {/* Left Column - Deity Darshan Gallery */}
                        <div className="lg:col-span-7 space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3">Today&apos;s Deity Darshan</h2>
                            <div className="grid grid-cols-1 gap-6">
                                {update.images.map((imgUrl, idx) => (
                                    <div key={idx} className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-3xl overflow-hidden shadow-md border border-gray-100 bg-white group">
                                        <Image
                                            src={imgUrl}
                                            alt={`${update.title} - Darshan ${idx + 1}`}
                                            fill
                                            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                            sizes="(max-width: 1024px) 100vw, 60vw"
                                        />
                                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                                            Image {idx + 1} of {update.images.length}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column - Thought & Video */}
                        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
                            
                            {/* Spiritual Thought Card */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur opacity-10" />
                                <div className="relative bg-white border border-gray-100 p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col gap-6">
                                    <div className="text-orange-500">
                                        <FaQuoteLeft size={36} className="opacity-30" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-3">Thought for the Day</h3>
                                        <p className="text-gray-700 text-[16px] leading-relaxed whitespace-pre-line font-medium border-l-4 border-orange-200 pl-4">
                                            {update.message}
                                        </p>
                                    </div>
                                    <div className="border-t border-gray-100 pt-6">
                                        <button
                                            onClick={handleShare}
                                            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-100 rounded-xl transition-all duration-200 active:scale-95 font-bold text-sm"
                                        >
                                            {copied ? (
                                                <>
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                                                    Link Copied to Clipboard!
                                                </>
                                            ) : (
                                                <>
                                                    <FaLink />
                                                    Copy Direct Link to Share
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* YouTube Video If Present */}
                            {update.youtubeVideoId && (
                                <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shadow-sm">
                                            <FaYoutube size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-950 text-sm">Spiritual Lecture / Kirtan</h4>
                                            <p className="text-gray-400 text-xs font-semibold">Today&apos;s multimedia connection</p>
                                        </div>
                                    </div>
                                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-black">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${update.youtubeVideoId}`}
                                            title="Spiritual Lecture / Kirtan"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            className="absolute top-0 left-0 w-full h-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto space-y-8">
                        {/* Spiritual Thought Card */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur opacity-15" />
                            <div className="relative bg-white border border-gray-100 p-8 sm:p-12 rounded-3xl shadow-xl flex flex-col gap-6">
                                <div className="text-orange-500">
                                    <FaQuoteLeft size={42} className="opacity-30" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-4">Thought for the Day</h3>
                                    <p className="text-gray-800 text-[18px] sm:text-[20px] leading-relaxed whitespace-pre-line font-medium border-l-4 border-orange-200 pl-6">
                                        {update.message}
                                    </p>
                                </div>
                                <div className="border-t border-gray-100 pt-8 mt-4">
                                    <button
                                        onClick={handleShare}
                                        className="inline-flex items-center justify-center gap-2 w-full py-4 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-100 rounded-xl transition-all duration-200 active:scale-95 font-bold text-sm"
                                    >
                                        {copied ? (
                                            <>
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                                                Link Copied to Clipboard!
                                            </>
                                        ) : (
                                            <>
                                                <FaLink />
                                                Copy Direct Link to Share
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* YouTube Video If Present */}
                        {update.youtubeVideoId && (
                            <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shadow-sm">
                                        <FaYoutube size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-950 text-base">Spiritual Lecture / Kirtan</h4>
                                        <p className="text-gray-400 text-xs font-semibold">Today&apos;s multimedia connection</p>
                                    </div>
                                </div>
                                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-black">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${update.youtubeVideoId}`}
                                        title="Spiritual Lecture / Kirtan"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        className="absolute top-0 left-0 w-full h-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
