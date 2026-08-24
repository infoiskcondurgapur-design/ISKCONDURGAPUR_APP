'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaGraduationCap } from 'react-icons/fa';

export default function CoursesList() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState<any[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/courses');
            const result = await response.json();

            if (response.ok) {
                setCourses(result.data);
                setFilteredCourses(result.data);
            } else {
                setError(result.message || 'Failed to fetch courses');
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const checkAuth = () => {
            const authToken = localStorage.getItem('iskcon_admin_token');
            if (!authToken) {
                router.push('/admin/login');
                return;
            }

            setIsAuthenticated(true);
            fetchCourses();
        };

        checkAuth();
    }, [router, fetchCourses]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;

        try {
            const response = await fetch(`/api/courses/${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (response.ok) {
                fetchCourses(); // Refresh list
            } else {
                alert(result.message || 'Failed to delete course');
            }
        } catch (err) {
            console.error('Error deleting course:', err);
            alert('Network error. Please try again.');
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value === '') {
            setFilteredCourses(courses);
            return;
        }

        const filtered = courses.filter(course =>
            course.title?.toLowerCase().includes(value.toLowerCase()) ||
            course.category?.toLowerCase().includes(value.toLowerCase()) ||
            course.instructor?.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredCourses(filtered);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-t-4 border-iskcon-orange border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <FaGraduationCap size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
                    </div>
                    <Link href="/admin/courses/add">
                        <button className="bg-iskcon-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center gap-2 shadow-lg">
                            <FaPlus /> Add Course
                        </button>
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search courses by title, category, or instructor..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange bg-white transition-all xl:w-1/2"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 font-semibold text-gray-600">Course Details</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Instructor</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Price / Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Featured</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.length > 0 ? (
                                    filteredCourses.map((course: any) => (
                                        <tr key={course._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0 relative">
                                                        <Image
                                                            src={(course.image && course.image.replace(/\\/g, '/')) || '/images/iskcon-logo.png'}
                                                            alt={course.title}
                                                            fill
                                                            className="object-cover"
                                                            sizes="48px"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{course.title}</div>
                                                        <div className="flex gap-1 mt-1">
                                                            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block">
                                                                {course.level || 'All Levels'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700 font-medium">
                                                    {course.instructor || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {course.price === 0 || course.price === 'Free' ? 'Free' : `₹${course.price}`}
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">
                                                    {course.status || 'Upcoming'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${course.featured
                                                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                    : 'bg-gray-50 text-gray-500 border border-gray-100'
                                                    }`}>
                                                    {course.featured ? 'Featured' : 'Regular'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/courses/edit/${course._id}`}>
                                                        <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                            <FaEdit size={18} />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(course._id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <FaTrash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                                <FaGraduationCap size={48} className="opacity-20" />
                                                <p className="italic text-lg">No courses found matching your criteria.</p>
                                            </div>
                                        </td>
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
