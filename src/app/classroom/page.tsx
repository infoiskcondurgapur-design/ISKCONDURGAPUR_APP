'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaPlus, FaBookReader, FaSpinner, FaSignInAlt } from 'react-icons/fa';

interface Batch {
    _id: string;
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

export default function ClassroomDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        // Load logged in user
        const rawUser = localStorage.getItem('auth_user');
        if (!rawUser) {
            router.push('/auth/login?redirect=/classroom');
            return;
        }
        try {
            setUser(JSON.parse(rawUser));
        } catch (e) {
            console.error(e);
        }
        fetchBatches();
    }, [router]);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/classroom/batches');
            const data = await res.json();
            if (res.ok) {
                setBatches(data.data || []);
            }
        } catch (e) {
            console.error('Failed to load batches:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setJoining(true);
        setMessage(null);

        try {
            const res = await fetch('/api/classroom/batches/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: code.trim() })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `Successfully joined batch ${data.data.name}!` });
                setCode('');
                fetchBatches();
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to join batch.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error joining batch. Check your internet connection.' });
        } finally {
            setJoining(false);
        }
    };

    const studentName = user ? (user.spiritualName || user.fullName || user.username) : 'Hare Krishna';

    return (
        <main className="min-h-screen bg-gray-50 pt-28 pb-16">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header Title */}
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                        <FaGraduationCap className="text-orange-500" /> Classroom
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your courses and batches here</p>
                </div>

                {/* Welcome Banner */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#f27e2b] rounded-2xl p-8 text-white shadow-lg mb-8 relative overflow-hidden"
                >
                    <div className="relative z-10 max-w-lg">
                        <p className="text-lg opacity-90 font-medium">Welcome back,</p>
                        <h2 className="text-3.5xl font-black mt-1 mb-2 tracking-tight">{studentName}</h2>
                        <p className="text-sm opacity-90 font-light">Continue your spiritual learning journey</p>
                    </div>
                    {/* Decorative abstract circle */}
                    <div className="absolute right-[-40px] bottom-[-45px] w-56 h-56 rounded-full bg-white/10" />
                    <div className="absolute right-[50px] top-[-30px] w-36 h-36 rounded-full bg-white/5" />
                </motion.div>

                {/* Guest Warning */}
                {!user && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-8 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">ΓÜá∩╕Å Preview Mode:</span>
                            <span>You are using the classroom as a guest. Log in to sync assignments with your user account.</span>
                        </div>
                        <Link href="/auth/login" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-4 rounded-lg flex items-center gap-1.5 transition-colors">
                            <FaSignInAlt size={13} /> Log In
                        </Link>
                    </div>
                )}

                {/* Grid Layout: Join Batch & Batches list */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Join Batch Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-1">
                            <FaPlus className="text-orange-500" /> Join Batch
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">Enter class code to join a batch</p>

                        <form onSubmit={handleJoinBatch} className="space-y-4">
                            <div>
                                <input 
                                    type="text" 
                                    placeholder="Enter class code (e.g. BS5-2026)" 
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                                />
                            </div>

                            {message && (
                                <p className={`text-xs font-semibold ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                    {message.text}
                                </p>
                            )}

                            <button 
                                type="submit"
                                disabled={joining || !code.trim()}
                                className="w-full bg-[#f27e2b] hover:bg-orange-600 text-white font-bold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                {joining ? (
                                    <>
                                        <FaSpinner className="animate-spin" /> Joining...
                                    </>
                                ) : (
                                    <>
                                        <FaPlus /> Join Batch
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* My Batches Section */}
                    <div className="md:col-span-2 space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FaBookReader className="text-orange-500" /> My Batches
                        </h3>

                        {loading ? (
                            <div className="flex items-center gap-3 py-12 justify-center text-gray-400">
                                <FaSpinner className="animate-spin text-2xl text-orange-500" />
                                <span>Loading your enrolled batches...</span>
                            </div>
                        ) : batches.length === 0 ? (
                            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center text-gray-500">
                                <p className="font-semibold text-lg mb-1">No enrolled batches yet</p>
                                <p className="text-sm">Join a batch using a class code provided by your instructor.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-6">
                                {batches.map((batch) => (
                                    <motion.div 
                                        key={batch._id}
                                        whileHover={{ y: -2 }}
                                        className="bg-white rounded-xl shadow-sm border border-gray-150 p-6 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                {/* Circle Avatar */}
                                                <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center text-[#f27e2b] font-extrabold text-lg">
                                                    {batch.name.charAt(0)}
                                                </div>
                                                {/* Active status */}
                                                <span className="text-xs text-orange-500 bg-orange-50 font-bold border border-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Active
                                                </span>
                                            </div>

                                            <h4 className="font-black text-gray-800 text-lg mb-1">{batch.name}</h4>
                                            <p className="text-xs text-gray-400 mb-4">Enrolled: {new Date(batch.createdAt).toLocaleDateString('en-IN')}</p>
                                        </div>

                                        <Link 
                                            href={`/classroom/batches/${batch._id}`}
                                            className="w-full text-center border border-orange-100 hover:border-orange-400 hover:bg-orange-50 text-[#f27e2b] font-bold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2"
                                        >
                                            View Assessments
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
