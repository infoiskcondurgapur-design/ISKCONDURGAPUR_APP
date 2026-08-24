'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCalendarAlt } from 'react-icons/fa';

export default function EventsList() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/events');
            const result = await response.json();

            if (response.ok) {
                setEvents(result.data);
                setFilteredEvents(result.data);
            } else {
                setError(result.message || 'Failed to fetch events');
            }
        } catch (err) {
            console.error('Error fetching events:', err);
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
            fetchEvents();
        };

        checkAuth();
    }, [router, fetchEvents]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const response = await fetch(`/api/events/${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (response.ok) {
                fetchEvents(); // Refresh list
            } else {
                alert(result.message || 'Failed to delete event');
            }
        } catch (err) {
            console.error('Error deleting event:', err);
            alert('Network error. Please try again.');
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value === '') {
            setFilteredEvents(events);
            return;
        }

        const filtered = events.filter(event =>
            event.title.toLowerCase().includes(value.toLowerCase()) ||
            event.location?.toLowerCase().includes(value.toLowerCase()) ||
            event.category?.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredEvents(filtered);
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
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <FaCalendarAlt size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Event Management</h1>
                    </div>
                    <Link href="/admin/events/add">
                        <button className="bg-iskcon-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center gap-2 shadow-lg">
                            <FaPlus /> Add Event
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
                                placeholder="Search events by title, location or category..."
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
                                    <th className="px-6 py-4 font-semibold text-gray-600">Event Details</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Date & Time</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Location</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map((event: any) => (
                                        <tr key={event._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0 relative">
                                                        <Image
                                                            src={(event.image && event.image.replace(/\\/g, '/')) || '/images/iskcon-logo.png'}
                                                            alt={event.title}
                                                            fill
                                                            className="object-cover"
                                                            sizes="48px"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{event.title}</div>
                                                        <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                                            {event.category}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700 font-medium">
                                                    {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(event.date).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {event.location || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${event.isFeatured
                                                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                    : 'bg-gray-50 text-gray-500 border border-gray-100'
                                                    }`}>
                                                    {event.isFeatured ? 'Featured' : 'Regular'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/events/edit/${event._id}`}>
                                                        <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                            <FaEdit size={18} />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(event._id)}
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
                                                <FaCalendarAlt size={48} className="opacity-20" />
                                                <p className="italic text-lg">No events found matching your criteria.</p>
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
