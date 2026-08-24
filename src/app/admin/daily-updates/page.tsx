'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
    FaArrowLeft, FaNewspaper, FaPlus, FaTrash, FaEdit, 
    FaSearch, FaInfoCircle, FaCalendarAlt, FaUpload, FaSpinner, FaEye 
} from 'react-icons/fa';

interface DailyUpdate {
    _id: string;
    date: string;
    title: string;
    message: string;
    images: string[];
    youtubeVideoId?: string;
    status: 'Draft' | 'Published';
}

export default function DailyUpdatesManagement() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [updates, setUpdates] = useState<DailyUpdate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        title: '',
        message: '',
        youtubeVideoId: '',
        status: 'Published' as 'Draft' | 'Published'
    });
    // Removed uploadedImages state variables

    useEffect(() => {
        const checkAuth = async () => {
            const authToken = localStorage.getItem('iskcon_admin_token');
            if (!authToken) {
                router.push('/admin/login');
                return;
            }
            try {
                const response = await fetch('/api/auth/verify', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                if (!response.ok) {
                    localStorage.removeItem('iskcon_admin_token');
                    router.push('/admin/login');
                    return;
                }
                const userData = await response.json();
                if (userData.role !== 'admin') {
                    localStorage.removeItem('iskcon_admin_token');
                    router.push('/admin/login');
                    return;
                }
                setIsAuthenticated(true);
                fetchUpdates();
            } catch (err) {
                console.error('Admin authentication verification network/abort error:', err);
            }
        };
        checkAuth();
    }, [router]);

    const fetchUpdates = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/daily-updates');
            if (!response.ok) throw new Error('Failed to fetch daily updates');
            const result = await response.json();
            setUpdates(result.data || []);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData
        };

        try {
            const url = isEditing 
                ? `/api/daily-updates/${editId}` 
                : '/api/daily-updates';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('iskcon_admin_token')}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to save update');

            setMessage({ 
                type: 'success', 
                text: isEditing ? 'Update updated successfully!' : 'Update created successfully!' 
            });
            
            setIsFormOpen(false);
            setIsEditing(false);
            setEditId(null);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                title: '',
                message: '',
                youtubeVideoId: '',
                status: 'Published'
            });
            
            fetchUpdates();
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const handleEdit = (update: DailyUpdate) => {
        setFormData({
            date: update.date,
            title: update.title,
            message: update.message,
            youtubeVideoId: update.youtubeVideoId || '',
            status: update.status
        });
        setEditId(update._id);
        setIsEditing(true);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this daily update?')) return;
        
        try {
            const response = await fetch(`/api/daily-updates/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('iskcon_admin_token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete update');
            
            setMessage({ type: 'success', text: 'Daily update deleted successfully!' });
            fetchUpdates();
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const filteredUpdates = updates.filter(update =>
        update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.date.includes(searchQuery)
    );

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[#F8F9FC] p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-iskcon-orange transition-colors font-semibold">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl mb-8 flex items-start gap-3 border ${
                        message.type === 'success' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        <FaInfoCircle className="mt-0.5 text-lg flex-shrink-0" />
                        <span className="font-semibold">{message.text}</span>
                    </div>
                )}

                {isFormOpen ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isEditing ? 'Edit Daily Update' : 'Publish Daily Update'}
                            </h2>
                            <button 
                                onClick={() => {
                                    setIsFormOpen(false);
                                    setIsEditing(false);
                                }}
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition"
                            >
                                Cancel
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-2">Update Date</label>
                                    <input
                                        type="date"
                                        id="date"
                                        required
                                        disabled={isEditing}
                                        value={formData.date}
                                        onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition text-sm font-semibold disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">Title / Theme</label>
                                    <input
                                        type="text"
                                        id="title"
                                        required
                                        placeholder="e.g. Shringar Darshan & Thought of the Day"
                                        value={formData.title}
                                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition text-sm font-semibold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">Nectarean Thought / Daily Message</label>
                                <textarea
                                    id="message"
                                    required
                                    rows={5}
                                    placeholder="Write the spiritual thought, translation of a verse, or general temple updates..."
                                    value={formData.message}
                                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition text-sm font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="youtubeVideoId" className="block text-sm font-bold text-gray-700 mb-2">YouTube Video ID (Optional)</label>
                                    <input
                                        type="text"
                                        id="youtubeVideoId"
                                        placeholder="e.g. ysz7vP73Nis (not full URL)"
                                        value={formData.youtubeVideoId}
                                        onChange={e => setFormData(prev => ({ ...prev, youtubeVideoId: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition text-sm font-semibold"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition text-sm font-semibold bg-white"
                                    >
                                        <option value="Published">Published</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-8 flex gap-4">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#FF6B00] hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                                >
                                    {isEditing ? 'Save Changes' : 'Publish Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <FaNewspaper className="text-iskcon-orange" /> Daily Temple Updates
                                </h1>
                                <p className="text-gray-500 mt-1 font-semibold">Publish and manage thoughts of the day and temple updates.</p>
                            </div>
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center gap-2 self-start md:self-center shadow-lg shadow-orange-500/20"
                            >
                                <FaPlus /> Add Daily Update
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Toolbar */}
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="relative w-full sm:w-80">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by date (YYYY-MM-DD) or title..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange bg-white transition-all text-sm font-semibold"
                                    />
                                </div>
                                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    {filteredUpdates.length} Updates Listed
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/30">
                                            <th className="py-4 px-6">Date</th>
                                            <th className="py-4 px-6">Title</th>
                                            <th className="py-4 px-6">Status</th>
                                            <th className="py-4 px-6 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={4} className="py-12 text-center">
                                                    <div className="flex justify-center items-center gap-2 text-gray-500 font-semibold">
                                                        <FaSpinner className="animate-spin text-[#FF6B00]" />
                                                        Loading daily updates...
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredUpdates.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">No updates found.</td>
                                            </tr>
                                        ) : (
                                            filteredUpdates.map(update => (
                                                <tr key={update._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                                                    <td className="py-4 px-6 font-bold text-gray-900 text-sm whitespace-nowrap">
                                                        <span className="flex items-center gap-2">
                                                            <FaCalendarAlt className="text-gray-400" />
                                                            {update.date}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 font-bold text-gray-800 text-[15px]">{update.title}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                                            update.status === 'Published' 
                                                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                        }`}>
                                                            {update.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Link
                                                                href={`/daily-updates/${update.date}`}
                                                                target="_blank"
                                                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition"
                                                                title="View Live"
                                                            >
                                                                <FaEye size={14} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleEdit(update)}
                                                                className="p-2 text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 rounded-xl transition"
                                                                title="Edit"
                                                            >
                                                                <FaEdit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(update._id)}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                                                                title="Delete"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
