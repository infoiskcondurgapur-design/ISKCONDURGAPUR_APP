'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    FaHome, FaUsers, FaCalendarAlt, FaMusic, FaRoute, 
    FaCog, FaImage, FaSignOutAlt, FaBookOpen, FaBars, FaTimes,
    FaChartLine, FaDatabase, FaAd, FaBlog, FaBug, FaClipboardList,
    FaHeartbeat, FaEdit, FaNewspaper, FaQuoteRight, FaFolderOpen,
    FaShieldAlt, FaVideo, FaHandHoldingHeart, FaFileAlt,
    FaEnvelopeOpen, FaGraduationCap
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('iskcon_admin_token');
        router.push('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <FaHome /> },
        { name: 'Temples', path: '/admin/temples', icon: <FaHome /> },
        { name: 'Projects', path: '/admin/projects', icon: <FaHandHoldingHeart /> },
        { name: 'Events', path: '/admin/events', icon: <FaCalendarAlt /> },
        { name: 'Courses', path: '/admin/courses', icon: <FaBookOpen /> },
        { name: 'Classroom', path: '/admin/classroom', icon: <FaGraduationCap /> },
        { name: 'Bhajans', path: '/admin/bhajans', icon: <FaMusic /> },
        { name: 'Tours', path: '/admin/tours', icon: <FaRoute /> },
        { name: 'Gallery', path: '/admin/gallery', icon: <FaImage /> },
        { name: 'Video Library', path: '/admin/video-library', icon: <FaVideo /> },
        { name: 'Resources', path: '/admin/resources', icon: <FaFolderOpen /> },
        { name: 'Quotes', path: '/admin/quotes', icon: <FaQuoteRight /> },
        { name: 'Prabhupada Letters', path: '/admin/letters', icon: <FaEnvelopeOpen /> },
        { name: 'Daily Updates', path: '/admin/daily-updates', icon: <FaNewspaper /> },
        { name: 'News', path: '/admin/news', icon: <FaNewspaper /> },
        { name: 'Blog', path: '/admin/blog', icon: <FaBlog /> },
        { name: 'Custom Pages', path: '/admin/custom-pages', icon: <FaFileAlt /> },
        { name: 'Homepage Editor', path: '/admin/homepage-editor', icon: <FaEdit /> },
        { name: 'Banner Management', path: '/admin/banner-management', icon: <FaAd /> },
        { name: 'Users', path: '/admin/users', icon: <FaUsers /> },
        { name: 'Forms', path: '/admin/forms', icon: <FaClipboardList /> },
        { name: 'Custom Forms', path: '/admin/custom-forms', icon: <FaEdit /> },
        { name: 'Settings', path: '/admin/settings', icon: <FaCog /> },
        { name: 'Analytics', path: '/admin/analytics', icon: <FaChartLine /> },
        { name: 'Security', path: '/admin/security', icon: <FaShieldAlt /> },
        { name: 'Health', path: '/admin/health', icon: <FaHeartbeat /> },
        { name: 'Backups', path: '/admin/backups', icon: <FaDatabase /> },
        { name: 'Errors', path: '/admin/errors', icon: <FaBug /> },
    ];

    const toggleMobileMenu = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            {/* Desktop Logo Area */}
            <div className="hidden md:flex h-24 items-center gap-4 px-8 border-b border-gray-50">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-[#FF6B00] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                    <FaHome size={22} />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900">
                    ISKCON<span className="text-[#FF6B00]">.</span>
                </h1>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-8 px-6 space-y-2 custom-scrollbar">
                <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Main Navigation</p>
                {navItems.map((item) => {
                    const isActive = item.path === '/admin' 
                        ? pathname === '/admin' 
                        : pathname.startsWith(item.path);
                        
                    return (
                        <Link 
                            key={item.name} 
                            href={item.path}
                            onClick={() => setIsMobileOpen(false)}
                            className="block relative group"
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="sidebar-active-bg"
                                    className="absolute inset-0 bg-orange-50 rounded-2xl border border-orange-100/50"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors duration-200 font-semibold ${
                                isActive 
                                ? 'text-[#FF6B00]' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                            }`}>
                                <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110 text-[#FF6B00]' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                <span className="text-[15px] tracking-wide">{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Logout Button */}
            <div className="p-6 border-t border-gray-50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 w-full px-4 py-3.5 text-gray-500 hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-all duration-200 font-semibold group"
                >
                    <FaSignOutAlt className="text-xl text-gray-400 group-hover:text-red-500 transition-colors" />
                    <span className="text-[15px] tracking-wide">Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Hamburger Menu */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-[#FF6B00] rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                        <FaHome size={16} />
                    </div>
                    <h1 className="font-black text-lg text-gray-900 tracking-tight">ISKCON<span className="text-[#FF6B00]">.</span></h1>
                </div>
                <button onClick={toggleMobileMenu} className="text-gray-900 focus:outline-none p-2 bg-gray-50 rounded-lg active:scale-95 transition-transform">
                    {isMobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block fixed inset-y-0 left-0 z-40 w-72">
                {sidebarContent}
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 md:hidden mt-16"
                            onClick={() => setIsMobileOpen(false)}
                        />
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="fixed inset-y-0 left-0 z-40 w-72 md:hidden mt-16"
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
