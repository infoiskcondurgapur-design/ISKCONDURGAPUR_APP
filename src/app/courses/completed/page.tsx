'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    FaCalendarAlt, FaClock, FaUsers, FaStar, FaSearch, FaSpinner,
    FaGraduationCap, FaArrowRight, FaCheckCircle, FaChevronDown,
    FaChevronUp, FaFilter, FaQuoteLeft, FaPlay
} from 'react-icons/fa';
import { getCourses, ApiCourse } from '@/lib/api';

interface Course {
    id: string; title: string; tagline: string; description: string; image: string;
    bannerColor: string; duration: string; startDate: string; endDate?: string;
    instructor: string; level: string; category: string; rating: number;
    enrolledCount: number; completedCount: number; certificate: boolean;
    price: number | string; language: string;
    highlights: string[]; testimonials: { name: string; text: string; rating: number }[];
    nextBatch?: string;
}

const BANNER = ['from-green-500 to-emerald-500','from-blue-600 to-cyan-500','from-amber-600 to-yellow-500','from-purple-600 to-indigo-500'];

const mapCourse = (c: ApiCourse, i: number): Course => ({
    id: c._id, title: c.title, tagline: c.tagline||'', description: c.description||'', image: c.image||'/images/iskcon-logo.png',
    bannerColor: c.banner_color||BANNER[i%BANNER.length], duration: c.duration||'', startDate: c.start_date||'', endDate: c.end_date,
    instructor: c.instructor||'Temple Team', level: c.level||'Beginner', category: c.category||'General',
    rating: c.rating||4.5, enrolledCount: c.enrolled_count||0, completedCount: c.enrolled_count||0,
    certificate: !!c.certificate, price: c.price??'Free', language: c.language||'',
    highlights: [], testimonials: [],
});

// ─── Data ─────────────────────────────────────────────────────────────────────
const FALLBACK_COURSES: Course[] = [];

const levelColor: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-800',
    Intermediate: 'bg-blue-100 text-blue-800',
    Advanced: 'bg-purple-100 text-purple-800',
};

export default function CompletedCoursesPage() {
    const [completedCourses, setCompletedCourses] = useState<Course[]>(FALLBACK_COURSES);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedTestimonials, setExpandedTestimonials] = useState<string[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getCourses();
                const raw: ApiCourse[] = Array.isArray(res.data) ? res.data : [];
                setCompletedCourses(raw.filter(c => c.status === 'Completed').map(mapCourse));
            } catch (err) {
                console.error('Failed to load completed courses:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const toggleTestimonials = (id: string) => {
        setExpandedTestimonials(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const categories = Array.from(new Set(completedCourses.map(c => c.category)));

    const filtered = completedCourses.filter(c => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase());
        const matchCategory = selectedCategory ? c.category === selectedCategory : true;
        const matchLevel = selectedLevel ? c.level === selectedLevel : true;
        return matchSearch && matchCategory && matchLevel;
    });

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Hero */}
            <section className="relative bg-gradient-to-r from-gray-800 to-gray-900 py-20 pt-28 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/30 via-gray-900/0 to-transparent" />
                {/* Trophy watermark */}
                <div className="absolute right-8 bottom-0 text-white/5 text-[14rem] select-none hidden lg:block leading-none">🏆</div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl"
                    >
                        <span className="inline-flex items-center gap-2 bg-gray-700 text-gray-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
                            <FaCheckCircle className="text-green-400" /> Completed Courses & Archives
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                            A Legacy of Spiritual Learning
                        </h1>
                        <p className="text-gray-400 text-lg mb-8 max-w-2xl">
                            Explore our past courses, read graduate testimonials, and register interest for the next batch.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8">
                            {[
                                { label: 'Courses Completed', value: completedCourses.length },
                                { label: 'Graduates', value: completedCourses.reduce((s, c) => s + c.completedCount, 0).toLocaleString() },
                                { label: 'Avg. Rating', value: completedCourses.length ? (completedCourses.reduce((s, c) => s + c.rating, 0) / completedCourses.length).toFixed(1) + ' ★' : '—' },
                                { label: 'Next Batches', value: completedCourses.length },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl font-black text-white">{stat.value}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {loading && (
                <div className="flex items-center justify-center py-24 bg-gray-50">
                    <FaSpinner className="animate-spin text-gray-500 text-4xl" />
                    <span className="ml-4 text-gray-500 text-lg">Loading completed courses…</span>
                </div>
            )}

            {!loading && (<>
            <div className="bg-white border-b border-gray-100 py-3">
                <div className="container mx-auto px-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/courses" className="hover:text-orange-600">All Courses</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">Completed</span>
                    <span className="ml-auto">
                        <Link href="/courses/upcoming" className="text-teal-600 hover:underline flex items-center gap-1 text-xs font-medium">
                            View Upcoming Courses <FaArrowRight size={10} />
                        </Link>
                    </span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10">

                {/* Search & Filters */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search archived courses..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700"
                        >
                            <FaFilter /> Filters {showFilters ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                        </button>
                    </div>

                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 overflow-hidden"
                        >
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-gray-400 focus:outline-none"
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select
                                value={selectedLevel}
                                onChange={e => setSelectedLevel(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-gray-400 focus:outline-none"
                            >
                                <option value="">All Levels</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                            <button
                                onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedLevel(''); }}
                                className="text-sm text-gray-400 hover:text-red-500 underline"
                            >
                                Clear all
                            </button>
                        </motion.div>
                    )}
                </div>

                <p className="text-gray-500 text-sm mb-6">
                    Showing <strong>{filtered.length}</strong> completed course{filtered.length !== 1 ? 's' : ''}
                </p>

                {/* Course Cards */}
                {filtered.length > 0 ? (
                    <div className="space-y-8">
                        {filtered.map((course, idx) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="flex flex-col lg:flex-row">
                                    {/* Image */}
                                    <div className={`relative lg:w-72 h-52 lg:h-auto bg-gradient-to-br ${course.bannerColor} shrink-0`}>
                                        <Image
                                            src={course.image}
                                            alt={course.title}
                                            fill
                                            className="object-cover opacity-70"
                                            sizes="(max-width: 1024px) 100vw, 288px"
                                        />
                                        {/* Completed overlay */}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <FaCheckCircle className="mx-auto text-4xl text-green-400 mb-2" />
                                                <span className="text-xs font-bold bg-green-500/80 px-3 py-1 rounded-full">Course Completed</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 p-6">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelColor[course.level]}`}>{course.level}</span>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{course.category}</span>
                                            {course.certificate && (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">📜 Certificate</span>
                                            )}
                                        </div>

                                        <h2 className="text-xl font-black text-gray-800 mb-1">{course.title}</h2>
                                        <p className="text-sm text-gray-500 mb-1 italic">{course.tagline}</p>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                                        {/* Meta */}
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                                            <span className="flex items-center gap-1"><FaCalendarAlt />
                                                {new Date(course.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                {course.endDate && <> – {new Date(course.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
                                            </span>
                                            <span className="flex items-center gap-1"><FaClock /> {course.duration}</span>
                                            <span className="flex items-center gap-1"><FaUsers /> {course.completedCount.toLocaleString()} graduates</span>
                                            <span className="flex items-center gap-1"><FaStar className="text-amber-500" /> {course.rating}</span>
                                        </div>

                                        {/* Highlights */}
                                        <div className="flex flex-wrap gap-2 mb-5">
                                            {course.highlights.map((h, i) => (
                                                <span key={i} className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full font-medium">
                                                    <FaCheckCircle size={10} /> {h}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-3 items-center">
                                            {/* Next Batch */}
                                            {course.nextBatch && (
                                                <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2">
                                                    <FaCalendarAlt className="text-teal-600 text-sm" />
                                                    <div>
                                                        <p className="text-xs text-teal-600 font-semibold">Next Batch</p>
                                                        <p className="text-xs text-teal-800 font-bold">
                                                            {new Date(course.nextBatch).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <Link
                                                href={`/courses/${course.id}`}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold rounded-xl hover:shadow-md transition-all"
                                            >
                                                Register for Next Batch <FaArrowRight size={11} />
                                            </Link>
                                            <button
                                                onClick={() => toggleTestimonials(course.id)}
                                                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                                            >
                                                {expandedTestimonials.includes(course.id) ? (
                                                    <><FaChevronUp size={11} /> Hide Reviews</>
                                                ) : (
                                                    <><FaQuoteLeft size={11} /> Read Reviews ({course.testimonials.length})</>
                                                )}
                                            </button>
                                        </div>

                                        {/* Testimonials */}
                                        {expandedTestimonials.includes(course.id) && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
                                            >
                                                {course.testimonials.map((t, i) => (
                                                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                        <div className="flex items-center gap-1 mb-2">
                                                            {[...Array(t.rating)].map((_, j) => (
                                                                <FaStar key={j} className="text-amber-400 text-xs" />
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-gray-600 italic mb-2">&quot;{t.text}&quot;</p>
                                                        <p className="text-xs font-bold text-gray-700">— {t.name}</p>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <FaGraduationCap className="mx-auto text-6xl text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-500 mb-2">No archived courses match your search</h3>
                        <p className="text-gray-400 text-sm mb-6">Try adjusting your filters.</p>
                        <button
                            onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedLevel(''); }}
                            className="btn-primary"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* CTA: Check Upcoming */}
                <div className="mt-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 md:p-12 text-center text-white">
                    <FaPlay className="mx-auto text-4xl mb-4 opacity-80" />
                    <h2 className="text-2xl md:text-3xl font-black mb-3">Ready to Start Learning?</h2>
                    <p className="text-white/80 mb-6 max-w-xl mx-auto text-sm">
                        These courses have ended, but new batches are starting soon! Register now for the upcoming sessions.
                    </p>
                    <Link href="/courses/upcoming" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-black rounded-xl hover:bg-gray-50 transition-all shadow-lg">
                        View Upcoming Courses <FaArrowRight />
                    </Link>
                </div>
            </div>
            </>
            )}
        </main>
    );
}
