'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClipboardList, FaEnvelope, FaTrash, FaCheck, FaEye, FaSearch, FaFilter } from 'react-icons/fa';

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'Contact' | 'Membership' | 'Volunteer';
  message: string;
  createdAt: string;
  status: 'Pending' | 'Reviewed';
}

export default function FormsAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('All'); // 'All', 'Contact', 'Membership', 'Volunteer'
  const [submissions, setSubmissions] = useState<Submission[]>([
    { id: '1', name: 'Abhijit Maji', email: 'abhijit.maji@gmail.com', phone: '9876543210', type: 'Membership', message: 'I would like to apply for lifetime membership at ISKCON Durgapur.', createdAt: '2026-06-11 10:15 AM', status: 'Pending' },
    { id: '2', name: 'Sourav Das', email: 'sourav.das@yahoo.com', phone: '8765432109', type: 'Volunteer', message: 'Interested in volunteering for the upcoming Janmashtami festival decoration and crowd management.', createdAt: '2026-06-10 03:40 PM', status: 'Pending' },
    { id: '3', name: 'Priya Sen', email: 'priya.sen@outlook.com', phone: '7654321098', type: 'Contact', message: 'Requesting info regarding Bhagavad Gita evening classes schedule.', createdAt: '2026-06-09 11:20 AM', status: 'Reviewed' },
    { id: '4', name: 'Debasish Dey', email: 'debasish.dey@gmail.com', phone: '9012345678', type: 'Membership', message: 'How do I pay the lifetime membership fee online?', createdAt: '2026-06-08 09:05 AM', status: 'Reviewed' }
  ]);

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('iskcon_admin_token');
      if (!authToken) {
        router.push('/admin/login');
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleReview = (id: string) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'Reviewed' as const } : s));
  };

  const handleDelete = (id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id));
  };

  const filteredSubmissions = filterType === 'All' 
    ? submissions 
    : submissions.filter(s => s.type === filterType);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-16 h-16 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
              Form <span className="text-[#FF6B00]">Submissions</span>
            </h1>
            <p className="text-gray-500 font-medium">
              Review messages, volunteer enrollments, and membership applications submitted by site visitors.
            </p>
          </div>
          
          {/* Tab selector */}
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex-wrap">
            {[
              { id: 'All', name: 'All' },
              { id: 'Contact', name: 'Contact' },
              { id: 'Membership', name: 'Membership' },
              { id: 'Volunteer', name: 'Volunteer' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  filterType === tab.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight flex items-center gap-2">
            <FaClipboardList className="text-orange-500" /> Form Entries ({filteredSubmissions.length})
          </h3>
          
          <div className="overflow-x-auto">
            {filteredSubmissions.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Submitter Info</th>
                    <th className="pb-3 px-4">Form Type</th>
                    <th className="pb-3 px-4">Message Snippet</th>
                    <th className="pb-3 px-4">Submitted At</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSubmissions.map(sub => (
                    <tr key={sub.id} className="group">
                      <td className="py-4 pr-4 text-sm font-semibold text-gray-800">
                        <div>{sub.name}</div>
                        <div className="text-xs text-gray-400 font-normal">{sub.email} | {sub.phone}</div>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          sub.type === 'Membership' 
                            ? 'bg-purple-50 text-purple-600 border border-purple-100'
                            : sub.type === 'Volunteer'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {sub.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500 max-w-[280px] truncate">
                        {sub.message}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-400">{sub.createdAt}</td>
                      <td className="py-4 px-4 text-sm font-medium">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          sub.status === 'Pending' 
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-gray-50 text-gray-400 border border-gray-100'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-sm text-right space-x-2">
                        <button 
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                          title="View Details"
                          onClick={() => alert(`Details:\n\nName: ${sub.name}\nEmail: ${sub.email}\nPhone: ${sub.phone}\nMessage: ${sub.message}`)}
                        >
                          <FaEye size={14} />
                        </button>
                        {sub.status === 'Pending' && (
                          <button 
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors inline-flex"
                            title="Mark as Reviewed"
                            onClick={() => handleReview(sub.id)}
                          >
                            <FaCheck size={14} />
                          </button>
                        )}
                        <button 
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-flex"
                          title="Delete Entry"
                          onClick={() => handleDelete(sub.id)}
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500 font-medium">
                No form submissions found in this category.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
