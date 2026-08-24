'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    FaArrowLeft, FaBookmark, FaRegBookmark, FaThumbtack, FaBookOpen,
    FaHeadphones, FaCalendarAlt, FaStar, FaSpinner
} from 'react-icons/fa';

interface Assessment {
    _id: string;
    title: string;
    description?: string;
    youtubeUrl?: string;
    dueDate: string;
    points: number;
    isPinned: boolean;
    status: 'Published' | 'Closed' | 'Draft';
    category: string;
    submissionStatus: 'Submitted' | 'Not Submitted';
}

export default function BatchAssessmentsPage() {
    const { batchId } = useParams();
    const router = useRouter();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

    useEffect(() => {
        // Load logged in user
        const rawUser = localStorage.getItem('auth_user');
        if (!rawUser) {
            router.push(`/auth/login?redirect=/classroom/batches/${batchId}`);
            return;
        }

        // Load bookmarks from localStorage
        const savedBookmarks = localStorage.getItem('classroom_bookmarks');
        if (savedBookmarks) {
            try {
                setBookmarks(JSON.parse(savedBookmarks));
            } catch (e) {
                console.error(e);
            }
        }
        fetchAssessments();
    }, [batchId, router]);

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/classroom/batches/${batchId}/assessments`);
            const data = await res.json();
            if (res.ok) {
                setAssessments(data.data || []);
            }
        } catch (e) {
            console.error('Failed to load assessments:', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleBookmark = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        let newBookmarks;
        if (bookmarks.includes(id)) {
            newBookmarks = bookmarks.filter(bId => bId !== id);
        } else {
            newBookmarks = [...bookmarks, id];
        }
        
        setBookmarks(newBookmarks);
        localStorage.setItem('classroom_bookmarks', JSON.stringify(newBookmarks));
    };

    const filteredAssessments = assessments.filter(a => {
        if (showBookmarkedOnly && !bookmarks.includes(a._id)) return false;
        return true;
    });

    const pinned = filteredAssessments.filter(a => a.isPinned);
    const others = filteredAssessments.filter(a => !a.isPinned);

    // Helpers for display
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const formatted = date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric'
            });
            
            // Check if due soon
            const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            let statusText = '';
            if (diffDays < 0) {
                statusText = ' (Overdue)';
            } else if (diffDays <= 3) {
                statusText = ' (Due Soon)';
            }
            
            return `Due: ${formatted}${statusText}`;
        } catch {
            return `Due: ${dateStr}`;
        }
    };

    const isOverdue = (dateStr: string) => {
        try {
            return new Date(dateStr).getTime() < Date.now();
        } catch {
            return false;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pt-28 pb-16">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Back Link */}
                <Link href="/classroom" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors mb-6">
                    <FaArrowLeft size={12} /> Back to Batches
                </Link>

                {/* Header Controls */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Assessments ({filteredAssessments.length})
                        </h1>
                    </div>
                    
                    <button 
                        onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                        className={`text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
                            showBookmarkedOnly 
                            ? 'bg-orange-50 text-orange-500 border-orange-200' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {showBookmarkedOnly ? <FaBookmark /> : <FaRegBookmark />}
                        {showBookmarkedOnly ? 'Showing Bookmarked' : 'Show Bookmarked'}
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center gap-3 py-24 justify-center text-gray-400">
                        <FaSpinner className="animate-spin text-3xl text-orange-500" />
                        <span>Loading assessments...</span>
                    </div>
                ) : filteredAssessments.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-150 p-16 text-center text-gray-500">
                        <FaBookOpen className="text-5xl text-gray-300 mx-auto mb-4" />
                        <p className="font-semibold text-lg mb-1">No assessments found</p>
                        <p className="text-sm">
                            {showBookmarkedOnly 
                                ? 'No tasks bookmarked yet.' 
                                : 'No assignments have been published for this batch yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* PINNED SECTION */}
                        {pinned.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-500 flex items-center gap-2">
                                    <FaThumbtack className="rotate-45" /> Pinned ({pinned.length})
                                </h3>

                                <div className="space-y-4">
                                    {pinned.map((item) => (
                                        <AssessmentCard 
                                            key={item._id} 
                                            item={item} 
                                            isBookmarked={bookmarks.includes(item._id)}
                                            onBookmark={(e) => toggleBookmark(item._id, e)}
                                            formatDate={formatDate}
                                            isOverdue={isOverdue}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* OTHER ASSESSMENTS SECTION */}
                        {others.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                    OTHER ASSESSMENTS ({others.length})
                                </h3>

                                <div className="space-y-4">
                                    {others.map((item) => (
                                        <AssessmentCard 
                                            key={item._id} 
                                            item={item} 
                                            isBookmarked={bookmarks.includes(item._id)}
                                            onBookmark={(e) => toggleBookmark(item._id, e)}
                                            formatDate={formatDate}
                                            isOverdue={isOverdue}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

// Sub-Component for Assessment Row Card
function AssessmentCard({ 
    item, 
    isBookmarked, 
    onBookmark, 
    formatDate,
    isOverdue
}: { 
    item: Assessment; 
    isBookmarked: boolean; 
    onBookmark: (e: React.MouseEvent) => void;
    formatDate: (str: string) => string;
    isOverdue: (str: string) => boolean;
}) {
    const isListening = item.category.toLowerCase().includes('listening');
    const isSubmitted = item.submissionStatus === 'Submitted';
    
    return (
        <Link href={`/classroom/tasks/${item._id}`}>
            <motion.div 
                whileHover={{ y: -1 }}
                className="bg-white rounded-xl shadow-sm border border-orange-100/70 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md border-l-4 border-l-orange-400 relative overflow-hidden"
            >
                <div className="flex gap-4 flex-1">
                    {/* Icon block */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                        isListening ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'
                    }`}>
                        {isListening ? <FaBookOpen size={18} /> : <FaBookOpen size={18} />}
                    </div>

                    <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h4 className="font-extrabold text-gray-800 text-lg leading-tight hover:text-orange-500 transition-colors">
                                {item.title}
                            </h4>
                            
                            {/* Bookmark Toggle */}
                            <button 
                                onClick={onBookmark} 
                                className="text-gray-400 hover:text-orange-400 transition-colors py-1"
                                aria-label="Bookmark"
                            >
                                {isBookmarked ? <FaBookmark className="text-orange-400" size={14} /> : <FaRegBookmark size={14} />}
                            </button>
                        </div>

                        {item.description && (
                            <p className="text-sm text-gray-500 line-clamp-1 max-w-3xl font-light">
                                {item.description}
                            </p>
                        )}

                        {item.youtubeUrl && (
                            <div className="text-xs text-orange-500 hover:underline inline-block truncate max-w-sm">
                                {item.youtubeUrl}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-xs font-semibold mt-2 text-gray-400">
                            {/* Due date */}
                            <span className={`flex items-center gap-1.5 ${
                                isOverdue(item.dueDate) && !isSubmitted ? 'text-red-500 bg-red-50 px-2 py-0.5 rounded-full' : ''
                            }`}>
                                <FaCalendarAlt size={12} /> {formatDate(item.dueDate)}
                            </span>
                            {/* Points */}
                            <span className="flex items-center gap-1.5">
                                Γ¡É {item.points} points
                            </span>
                            {/* Tag */}
                            <span className="bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full text-[10px] tracking-wide uppercase">
                                {item.category}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Submission & Publication Badges */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 self-start sm:self-center shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                        isSubmitted 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                        {item.submissionStatus}
                    </span>

                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                        item.status === 'Published'
                            ? 'bg-orange-50 text-[#f27e2b] border-orange-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                        {item.status}
                    </span>
                </div>
            </motion.div>
        </Link>
    );
}
