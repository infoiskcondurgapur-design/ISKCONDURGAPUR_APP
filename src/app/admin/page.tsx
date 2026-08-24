'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUsers, FaCalendarAlt, FaBookOpen, FaImage, FaHome, FaMusic, FaRoute, FaCog, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({
    temples: 0,
    events: 0,
    resources: 0,
    alerts: 0,
    users: 0,
    bhajans: 0,
    tours: 0
  });

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('iskcon_admin_token');
      if (!authToken) {
        router.push('/admin/login');
        return;
      }

      setIsAuthenticated(true);
      fetchStats();
      
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };

    checkAuth();
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const result = await response.json();
      if (response.ok) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-16 h-16 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10 font-sans">
      
      <motion.div 
        className="max-w-[1600px] mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-12 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00]/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
            {greeting}, <span className="text-[#FF6B00]">Admin</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl font-medium">
            Welcome to the ISKCON administrative control center. Here&apos;s what&apos;s happening across your digital presence today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
          
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-[#FF6B00]/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-orange-50 text-[#FF6B00] rounded-2xl flex items-center justify-center group-hover:bg-[#FF6B00] group-hover:text-white transition-colors duration-300 shadow-sm">
                <FaHome size={20} />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">+12%</span>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Temples</p>
            <p className="text-3xl font-black text-gray-900">{stats.temples}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                <FaCalendarAlt size={20} />
              </div>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">New</span>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Upcoming Events</p>
            <p className="text-3xl font-black text-gray-900">{stats.events}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                <FaUsers size={20} />
              </div>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Active</span>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">System Users</p>
            <p className="text-3xl font-black text-gray-900">{stats.users}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-rose-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                <FaShieldAlt size={20} />
              </div>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{stats.alerts} Alerts</span>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Security</p>
            <p className="text-3xl font-black text-gray-900">{stats.alerts}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                <FaMusic size={20} />
              </div>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Bhajans Book</p>
            <p className="text-3xl font-black text-gray-900">{stats.bhajans || 0}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-[#FF6B00]/30 transition-all duration-300 hover:-translate-y-1 group cursor-pointer" onClick={() => router.push('/admin/tours')}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-orange-50 text-[#FF6B00] rounded-2xl flex items-center justify-center group-hover:bg-[#FF6B00] group-hover:text-white transition-colors duration-300 shadow-sm">
                <FaRoute size={20} />
              </div>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Spiritual Tours</p>
            <p className="text-3xl font-black text-gray-900">{stats.tours || 0}</p>
          </motion.div>
        </motion.div>

        {/* Admin Sections Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Management Modules</h2>
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          <AdminModuleCard 
            href="/admin/temples"
            icon={<FaHome size={28} />}
            title="Temple Management"
            desc="Add, edit, or remove temple listings. Update schedules and contact details."
            colorClass="text-[#FF6B00]"
            bgHoverClass="hover:border-[#FF6B00]/30"
          />
          <AdminModuleCard 
            href="/admin/users"
            icon={<FaUsers size={28} />}
            title="User Control"
            desc="Manage accounts, assign roles, and control access permissions across the platform."
            colorClass="text-purple-500"
            bgHoverClass="hover:border-purple-500/30"
          />
          <AdminModuleCard 
            href="/admin/events"
            icon={<FaCalendarAlt size={28} />}
            title="Event Planner"
            desc="Schedule festivals and programs. Set dates, times, and locations."
            colorClass="text-blue-500"
            bgHoverClass="hover:border-blue-500/30"
          />
          <AdminModuleCard 
            href="/admin/bhajans"
            icon={<FaMusic size={28} />}
            title="Bhajan Songbook"
            desc="Add new devotional songs, lyrics, transliterations, and audio streams."
            colorClass="text-amber-500"
            bgHoverClass="hover:border-amber-500/30"
          />
          <AdminModuleCard 
            href="/admin/tours"
            icon={<FaRoute size={28} />}
            title="Spiritual Tours"
            desc="Manage sacred pilgrimages, update itineraries, pricing, and inclusions."
            colorClass="text-[#FF6B00]"
            bgHoverClass="hover:border-[#FF6B00]/30"
          />
          <AdminModuleCard 
            href="/admin/courses"
            icon={<FaBookOpen size={28} />}
            title="Spiritual Courses"
            desc="Manage enrollments, course syllabus, and lecture schedules."
            colorClass="text-emerald-500"
            bgHoverClass="hover:border-emerald-500/30"
          />
          <AdminModuleCard 
            href="/admin/gallery"
            icon={<FaImage size={28} />}
            title="Photo Gallery"
            desc="Upload images and organize event pictures for public display."
            colorClass="text-teal-500"
            bgHoverClass="hover:border-teal-500/30"
          />
          <AdminModuleCard 
            href="/admin/settings"
            icon={<FaCog size={28} />}
            title="Website Settings"
            desc="Global configurations, notice banners, and social media links."
            colorClass="text-gray-700"
            bgHoverClass="hover:border-gray-500/30"
          />
          
        </motion.div>
      </motion.div>
    </div>
  );
}

function AdminModuleCard({ href, icon, title, desc, colorClass, bgHoverClass }: any) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
      <Link href={href} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-3xl">
        <div className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 ${bgHoverClass} h-full flex flex-col group`}>
          <div className={`mb-6 ${colorClass} bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{title}</h3>
          <p className="text-gray-500 text-[15px] leading-relaxed mb-8 flex-grow font-medium">
            {desc}
          </p>
          <div className={`flex items-center ${colorClass} font-bold text-[13px] uppercase tracking-widest group-hover:gap-3 transition-all duration-300`}>
            Manage <span className="text-lg leading-none mt-[-2px] ml-2">→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}