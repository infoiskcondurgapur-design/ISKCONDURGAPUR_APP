'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaArrowRight } from 'react-icons/fa';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data.data) {
          setProjects(data.data);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const getPercentFunded = (raised: number, target: number) => {
    if (!target) return 0;
    return Math.min(Math.round((raised / target) * 100), 100);
  };

  // Variants for alternating animations
  const imageLeftVariants = {
    hidden: { opacity: 0, x: -70 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  const textRightVariants = {
    hidden: { opacity: 0, x: 70 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  const imageRightVariants = {
    hidden: { opacity: 0, x: 70 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  const textLeftVariants = {
    hidden: { opacity: 0, x: -70 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  const progressVariants = {
    hidden: { width: 0 },
    show: (percent: number) => ({
      width: `${percent}%`,
      transition: { duration: 1.5, ease: 'easeOut', delay: 0.4 }
    })
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-[#FAF6F0] via-white to-[#FAF6F0] relative overflow-hidden">
      
      {/* Floating Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ y: [0, 45, 0], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-5 w-80 h-80 bg-orange-200/15 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ y: [0, -60, 0], x: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-5 w-[28rem] h-[28rem] bg-amber-200/15 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ y: [0, 35, 0], x: [0, -25, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-red-100/10 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Header */}
      <section className="relative py-12 mb-8 text-center z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="text-[#FF6B00] font-black text-xs uppercase tracking-widest bg-orange-100/60 px-4 py-2 rounded-full mb-4 inline-block cursor-default select-none"
            >
              ISKCON Durgapur
            </motion.span>
            
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-5 font-serif">
              Our Projects
            </h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-600 mx-auto mb-6 rounded-full" 
            />
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Serving the community through spiritual, educational, cultural, and welfare initiatives. 
              Discover our various programs and find out how you can contribute.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Alternating Projects Layout with Viewport Animations */}
      <section className="container mx-auto px-4 max-w-6xl z-10 relative">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-t-4 border-[#8B4513] border-solid rounded-full animate-spin"></div>
          </div>
        ) : projects.length > 0 ? (
          <div className="space-y-16 lg:space-y-24">
            <AnimatePresence mode="popLayout">
              {projects.map((project, index) => {
                const percent = getPercentFunded(project.raisedAmount || 0, project.targetAmount || 0);
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={project._id}
                    layout
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-80px' }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center py-8"
                  >
                    
                    {/* Image Column */}
                    <motion.div
                      variants={isEven ? imageLeftVariants : imageRightVariants}
                      className={`relative h-[250px] sm:h-[350px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-orange-100/20 bg-orange-50/30 group ${
                        isEven ? 'md:order-1' : 'md:order-2'
                      }`}
                    >
                      <Image
                        src={project.image || '/images/iskcon-logo.png'}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-[10px] font-black text-gray-900 shadow-sm tracking-widest uppercase">
                          {project.category}
                        </span>
                        <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black text-white shadow-sm tracking-widest uppercase ${
                          project.status === 'Completed' ? 'bg-green-600' : 'bg-[#FF6B00]'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </motion.div>

                    {/* Details Column */}
                    <motion.div
                      variants={isEven ? textRightVariants : textLeftVariants}
                      className={`flex flex-col justify-center ${
                        isEven ? 'md:order-2' : 'md:order-1'
                      }`}
                    >
                      <span className="text-xs font-black text-[#FF6B00] tracking-widest uppercase mb-2">
                        PROJECT DETAILS
                      </span>
                      
                      <h3 className="text-2xl lg:text-3xl font-black text-[#5C3A21] mb-4 tracking-tight hover:text-[#FF6B00] transition-colors duration-300 leading-tight font-serif">
                        {project.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
                        {project.description}
                      </p>

                      {/* Crowdfunding progress */}
                      {project.targetAmount > 0 && (
                        <div className="mb-6 bg-orange-50/20 p-5 rounded-3xl border border-orange-100/30 shadow-inner">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-bold text-amber-900/50 uppercase tracking-widest">Fundraising Progress</span>
                            <span className="text-sm font-black text-[#8B4513]">{percent}%</span>
                          </div>
                          
                          {/* Progress bar background */}
                          <div className="w-full h-2.5 bg-gray-200/60 rounded-full overflow-hidden">
                            <motion.div
                              variants={progressVariants}
                              custom={percent}
                              className="h-full bg-gradient-to-r from-amber-600 to-orange-500 rounded-full"
                            />
                          </div>

                          <div className="flex justify-between items-center mt-3 text-xs font-bold text-gray-500">
                            <span className="flex items-center gap-1">
                              <span className="font-black text-gray-900">Γé╣{(project.raisedAmount || 0).toLocaleString('en-IN')}</span> raised
                            </span>
                            <span>
                              Goal: <span className="font-bold text-gray-700">Γé╣{project.targetAmount.toLocaleString('en-IN')}</span>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                          <FaUsers className="text-[#FF6B00]" />
                          <span className="font-black text-gray-800">{project.donorsCount || 0}</span> Donors
                        </span>
                        
                        <Link 
                          href={`/about/projects/${project._id}`}
                          className="flex items-center gap-2 text-xs font-black uppercase text-[#8B4513] tracking-widest hover:gap-3.5 transition-all ml-auto hover:text-[#FF6B00] group"
                        >
                          Learn More & Support 
                          <FaArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
                        </Link>
                      </div>

                    </motion.div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md mx-auto">
            <p className="text-gray-500 text-lg font-bold mb-2">No projects found</p>
            <p className="text-gray-400 text-sm">There are currently no active projects listed.</p>
          </div>
        )}
      </section>
    </div>
  );
}
