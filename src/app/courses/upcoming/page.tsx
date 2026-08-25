'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    FaCalendarAlt, FaClock, FaUsers, FaStar, FaSearch, FaSpinner,
    FaFilter, FaMapMarkerAlt, FaGraduationCap, FaArrowRight,
    FaTag, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { getCourses, ApiCourse } from '@/lib/api';

interface Course {
    id: string; title: string; tagline: string; description: string; image: string;
    bannerColor: string; duration: string; schedule: string; startDate: string;
    enrolledCount: number; maxSeats: number; instructor: string; level: string;
    category: string; rating: number; featured: boolean; price: number | string;
    originalPrice?: number; language: string; location: string; mode: string;
    certificate: boolean; daysLeft: number;
}

const BANNER = ['from-teal-500 to-cyan-500','from-orange-500 to-amber-500','from-purple-600 to-indigo-600','from-rose-600 to-pink-500','from-amber-600 to-yellow-500'];

const mapCourse = (c: ApiCourse, i: number): Course => {
    const daysLeft = c.start_date ? Math.max(0, Math.ceil((new Date(c.start_date).getTime() - Date.now()) / 86400000)) : 0;
    return { id: c._id, title: c.title, tagline: c.tagline||'', description: c.description||'', image: c.image||'/images/iskcon-logo.png', bannerColor: c.banner_color||BANNER[i%BANNER.length], duration: c.duration||'', schedule: c.schedule||'', startDate: c.start_date||'', enrolledCount: c.enrolled_count||0, maxSeats: c.max_seats||60, instructor: c.instructor||'Temple Team', level: c.level||'Beginner', category: c.category||'General', rating: c.rating||4.5, featured: !!c.featured, price: c.price??'Free', language: c.language||'', location: c.location||'', mode: c.mode||'', certificate: !!c.certificate, daysLeft };
};

// ─── Reusing shared course data ───────────────────────────────────────────────
const FALLBACK_COURSES: Course[] = [];

const getUpcomingCourses = async (): Promise<Course[]> => {
    const res = await getCourses();
    const raw: ApiCourse[] = Array.isArray(res.data) ? res.data : [];
    const upcoming = raw
        .filter(c => c.status !== 'Completed')
        .sort((a, b) => (a.start_date || '').localeCompare(b.start_date || ''));
    return upcoming.map(mapCourse);
};

// categories derived dynamically from loaded courses

const levelColor: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-800',
    Intermediate: 'bg-blue-100 text-blue-800',
    Advanced: 'bg-purple-100 text-purple-800',
};

export default function UpcomingCoursesPage() {
    const [upcomingCourses, setUpcomingCourses] = useState<Course[]>(FALLBACK_COURSES);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'rating' | 'price'>('date');
    const categories = Array.from(new Set(upcomingCourses.map(c => c.category)));

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getUpcomingCourses();
                setUpcomingCourses(res);
            } catch (err) {
                console.error('Failed to load courses:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = upcomingCourses
        .filter(c => {
            const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                c.description.toLowerCase().includes(search.toLowerCase());
            const matchCategory = selectedCategory ? c.category === selectedCategory : true;
            const matchLevel = selectedLevel ? c.level === selectedLevel : true;
            return matchSearch && matchCategory && matchLevel;
        })
        .sort((a, b) => {
            if (sortBy === 'date') return a.daysLeft - b.daysLeft;
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'price') {
                const aPrice = typeof a.price === 'number' ? a.price : 0;
                const bPrice = typeof b.price === 'number' ? b.price : 0;
                return aPrice - bPrice;
            }
            return 0;
        });

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Hero */}
            <section className="relative bg-gradient-to-r from-teal-600 to-cyan-600 py-16 pt-28">
                <div className="absolute inset-0 bg-black/20" />
                {/* Decorative Om symbol */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-white/10 text-[12rem] font-serif select-none hidden lg:block">ॐ</div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl"
                    >
                        <span className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
                            <FaCalendarAlt /> Upcoming Courses
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                            Begin Your Spiritual Journey
                        </h1>
                        <p className="text-white/85 text-lg mb-8 max-w-2xl">
                            Register early to secure your seat. Our courses fill up fast — especially the popular ones!
                        </p>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-6 text-white">
                            <div className="text-center">
                                <div className="text-3xl font-black">{upcomingCourses.length}</div>
                                <div className="text-xs text-white/70 uppercase tracking-wider">Courses</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black">
                                    {upcomingCourses.filter(c => c.price === 'Free').length}
                                </div>
                                <div className="text-xs text-white/70 uppercase tracking-wider">Free</div>
                            </div>
                            <div className="text-center">
                                    {Array.from(new Set(upcomingCourses.map(c => c.category))).length}
                                <div className="text-xs text-white/70 uppercase tracking-wider">Categories</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black">{Math.min(...upcomingCourses.map(c => c.daysLeft))}</div>
                                <div className="text-xs text-white/70 uppercase tracking-wider">Days to Earliest</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {loading && (
                <div className="flex items-center justify-center py-24 bg-gray-50">
                    <FaSpinner className="animate-spin text-teal-500 text-4xl" />
                    <span className="ml-4 text-gray-500 text-lg">Loading courses from database…</span>
                </div>
            )}

            {!loading && (<>
            <div className="bg-amber-50 border-b border-amber-200 py-3">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start text-sm text-amber-800">
                        {upcomingCourses.slice(0, 3).map(c => (
                            <span key={c.id} className="flex items-center gap-2">
                                <FaCalendarAlt className="text-amber-500" />
                                <strong>{c.title}</strong> starts in <strong>{c.daysLeft} days</strong>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="container mx-auto px-4 py-10">
                {/* Search & Filters */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search upcoming courses..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as 'date' | 'rating' | 'price')}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm bg-white"
                        >
                            <option value="date">Sort: Earliest First</option>
                            <option value="rating">Sort: Highest Rated</option>
                            <option value="price">Sort: Lowest Price</option>
                        </select>
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
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100"
                        >
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-teal-400 focus:outline-none"
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select
                                value={selectedLevel}
                                onChange={e => setSelectedLevel(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-teal-400 focus:outline-none"
                            >
                                <option value="">All Levels</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                            <button
                                onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedLevel(''); }}
                                className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 underline"
                            >Clear all</button>
                        </motion.div>
                    )}
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600 text-sm">
                        Showing <strong>{filtered.length}</strong> upcoming course{filtered.length !== 1 ? 's' : ''}
                    </p>
                    <Link href="/courses/completed" className="text-sm text-teal-600 hover:underline flex items-center gap-1">
                        View Completed Courses <FaArrowRight size={12} />
                    </Link>
                </div>

                {/* Course Grid */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                        {filtered.map((course, idx) => {
                            const seatsLeft = course.maxSeats - (course.enrolledCount % course.maxSeats);
                            const seatsPercent = ((course.maxSeats - seatsLeft) / course.maxSeats) * 100;

                            return (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group"
                                >
                                    {/* Image */}
                                    <div className={`relative h-44 bg-gradient-to-br ${course.bannerColor}`}>
                                        <Image
                                            src={course.image}
                                            alt={course.title}
                                            fill
                                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            {course.featured && (
                                                <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>
                                            )}
                                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                🟢 {course.daysLeft}d to start
                                            </span>
                                        </div>
                                        {/* Price */}
                                        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow">
                                            <span className="text-orange-600 font-black text-sm">
                                                {typeof course.price === 'number' ? `₹${course.price.toLocaleString()}` : 'Free'}
                                            </span>
                                            {course.originalPrice && (
                                                <span className="text-gray-400 line-through text-xs ml-1">₹{course.originalPrice}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        {/* Level & Category */}
                                        <div className="flex gap-2 mb-2">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelColor[course.level]}`}>{course.level}</span>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{course.category}</span>
                                        </div>

                                        <h3 className="font-bold text-gray-800 text-lg leading-snug mb-1 group-hover:text-teal-700 transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-xs text-teal-600 font-medium mb-2">{course.tagline}</p>
                                        <p className="text-gray-500 text-xs mb-3 line-clamp-2">{course.description}</p>

                                        {/* Details */}
                                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                                            <span className="flex items-center gap-1"><FaClock /> {course.duration}</span>
                                            <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(course.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                            <span className="flex items-center gap-1"><FaUsers /> {course.maxSeats - seatsLeft}/{course.maxSeats} enrolled</span>
                                            <span className="flex items-center gap-1"><FaStar className="text-amber-500" /> {course.rating}</span>
                                        </div>

                                        {/* Seats Progress */}
                                        <div className="mb-4">
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                                                    style={{ width: `${seatsPercent}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{seatsLeft} seats remaining</p>
                                        </div>

                                        {/* Instructor & CTA */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400">Instructor</p>
                                                <p className="text-xs font-semibold text-gray-700">{course.instructor}</p>
                                            </div>
                                            <Link
                                                href={`/courses/${course.id}`}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold rounded-xl hover:shadow-md transition-all"
                                            >
                                                Register Now <FaArrowRight size={10} />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <FaGraduationCap className="mx-auto text-6xl text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-500 mb-2">No courses match your search</h3>
                        <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search terms.</p>
                        <button
                            onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedLevel(''); }}
                            className="btn-primary"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Newsletter CTA */}
                <div className="mt-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-8 md:p-12 text-center text-white">
                    <h2 className="text-2xl md:text-3xl font-black mb-3">Don&apos;t Miss a New Course Announcement!</h2>
                    <p className="text-white/80 mb-6 max-w-xl mx-auto text-sm">
                        Join 2,000+ devotees who receive our monthly course newsletter with early-bird registration offers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 px-4 py-3 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <button className="px-6 py-3 bg-white text-teal-700 font-bold rounded-xl hover:bg-gray-50 transition text-sm">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
            </>
            )}
        </main>
    );
}
