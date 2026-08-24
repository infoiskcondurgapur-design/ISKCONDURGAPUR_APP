'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaHeart, FaUsers, FaDonate, FaCheckCircle, FaChevronRight } from 'react-icons/fa';

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [donateAmount, setDonateAmount] = useState<number | string>('1000');
  const [showThankYou, setShowThankYou] = useState(false);
  const [donorName, setDonorName] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        const data = await res.json();
        if (data.data) {
          setProject(data.data);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [params.id]);

  const getPercentFunded = (raised: number, target: number) => {
    if (!target) return 0;
    return Math.min(Math.round((raised / target) * 100), 100);
  };

  const handleQuickAmount = (amount: number) => {
    setDonateAmount(amount);
  };

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donateAmount || Number(donateAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    // Simulate updating raised amount in offline mode or DB
    // We would make an API call here. For now, let's trigger the visual thank you modal.
    setShowThankYou(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-28 pb-16 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h2>
        <p className="text-gray-600 mb-6">The project you are looking for does not exist or has been removed.</p>
        <Link href="/about/projects" className="btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  const percent = getPercentFunded(project.raisedAmount || 0, project.targetAmount || 0);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#F8F9FC]">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Back navigation */}
        <div className="mb-8">
          <Link 
            href="/about/projects" 
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#FF6B00] transition-colors"
          >
            <FaArrowLeft /> Back to Projects
          </Link>
        </div>

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Main Content Column */}
          <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm p-6 sm:p-10">
            
            {/* Header / Info */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2.5 mb-4">
                <span className="bg-orange-50 px-3.5 py-1.5 rounded-full text-xs font-black text-[#FF6B00] uppercase tracking-wide">
                  {project.category}
                </span>
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-black text-white ${
                  project.status === 'Completed' ? 'bg-green-500' : 'bg-[#FF6B00]'
                } uppercase tracking-wide`}>
                  {project.status}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                {project.title}
              </h1>
            </div>

            {/* Featured Image */}
            <div className="relative h-[25rem] w-full rounded-2xl overflow-hidden mb-10 shadow-sm bg-orange-50">
              <Image 
                src={project.image || '/images/iskcon-logo.png'} 
                alt={project.title} 
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>

            {/* Story / Full Description */}
            <div className="prose max-w-none text-gray-600 leading-relaxed space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3">
                About this Project
              </h3>
              
              {/* Splitting paragraphs and rendering them */}
              {project.fullDescription ? (
                project.fullDescription.split('\n\n').map((para: string, idx: number) => (
                  <p key={idx} className="whitespace-pre-line text-[16px]">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-[16px]">{project.description}</p>
              )}
            </div>

            {/* Impact / Benefits list */}
            <div className="mt-12 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" /> Why Support this Project?
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-gray-600">
                <li className="flex items-center gap-2.5">
                  <FaChevronRight className="text-[#FF6B00] text-xs" /> Direct spiritual impact
                </li>
                <li className="flex items-center gap-2.5">
                  <FaChevronRight className="text-[#FF6B00] text-xs" /> Transparent fund utilisation
                </li>
                <li className="flex items-center gap-2.5">
                  <FaChevronRight className="text-[#FF6B00] text-xs" /> 80G tax exemption eligible
                </li>
                <li className="flex items-center gap-2.5">
                  <FaChevronRight className="text-[#FF6B00] text-xs" /> Community welfare & empowerment
                </li>
              </ul>
            </div>
          </div>

          {/* Right Sidebar - Donation & Progress Column */}
          <div className="space-y-8 lg:sticky lg:top-28">
            
            {/* Progress Card */}
            {project.targetAmount > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Funded Progress</span>
                  <span className="text-lg font-black text-[#FF6B00]">{percent}%</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden mb-6">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" 
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-50">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Raised So Far</span>
                    <span className="text-xl font-black text-gray-900">Γé╣{(project.raisedAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Target Goal</span>
                    <span className="text-xl font-bold text-gray-700">Γé╣{project.targetAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                  <div className="w-10 h-10 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center">
                    <FaUsers size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800">{project.donorsCount || 0}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Generous Donors</p>
                  </div>
                </div>
              </div>
            )}

            {/* Donation Form Card */}
            {project.status !== 'Completed' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/5 rounded-full translate-y-[-20%] translate-x-[20%] blur-xl pointer-events-none" />
                
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaDonate className="text-[#FF6B00]" /> Support this Seva
                </h3>

                <form onSubmit={handleDonateSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Donation Amount</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[500, 1000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleQuickAmount(amt)}
                          className={`py-3.5 rounded-xl text-sm font-bold border transition-all ${
                            Number(donateAmount) === amt
                              ? 'border-[#FF6B00] bg-orange-50/40 text-[#FF6B00]'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                          }`}
                        >
                          Γé╣{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Or Enter Custom Amount (Γé╣)</label>
                    <input 
                      type="number"
                      required
                      min="10"
                      value={donateAmount}
                      onChange={(e) => setDonateAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-[#FF6B00] font-bold text-gray-800 bg-white text-lg transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Name (Optional)</label>
                    <input 
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="E.g., Krishna Das"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-[#FF6B00] font-bold text-gray-700 bg-white text-sm transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#FF6B00] hover:bg-orange-700 text-white py-4 rounded-xl font-bold transition duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/20"
                  >
                    <FaHeart /> Make Contribution
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thank you Modal Dialog */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-gray-100 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full translate-y-[-20%] translate-x-[20%] blur-xl" />
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <FaHeart size={28} className="animate-pulse" />
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 mb-2">Hare Krishna!</h3>
            <p className="text-gray-600 font-bold text-md mb-4">
              Thank you {donorName ? donorName : 'Generous Soul'} for your support!
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Your donation simulation of <span className="font-bold text-gray-800">Γé╣{Number(donateAmount).toLocaleString('en-IN')}</span> for the project &quot;{project.title}&quot; was successfully simulated.
            </p>
            
            <button
              onClick={() => {
                setShowThankYou(false);
                // Dynamically update the visual view
                setProject((prev: any) => ({
                  ...prev,
                  raisedAmount: prev.raisedAmount + Number(donateAmount),
                  donorsCount: prev.donorsCount + 1
                }));
              }}
              className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider transition-colors duration-300 w-full"
            >
              Continue
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
