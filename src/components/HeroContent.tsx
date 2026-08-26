'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaPrayingHands } from 'react-icons/fa';

export default function HeroContent() {
  const [content, setContent] = useState({
    heroTitle: 'ISKCON Durgapur',
    heroSubtitle: '',
    heroCtaText: 'Visit Temple',
    heroCtaLink: '/about',
    welcomeMessage: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        const result = await res.json();
        if (res.ok && result.data) {
          setContent(prev => ({
            heroTitle: result.data.heroTitle || prev.heroTitle,
            heroSubtitle: result.data.heroSubtitle || prev.heroSubtitle,
            heroCtaText: result.data.heroCtaText || prev.heroCtaText,
            heroCtaLink: result.data.heroCtaLink || prev.heroCtaLink,
            welcomeMessage: result.data.welcomeMessage || prev.welcomeMessage
          }));
        }
      } catch (err) {
        console.error('Error loading homepage content:', err);
      }
    };
    load();
  }, []);
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-300 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-200 rounded-full blur-3xl opacity-50" />
        </div>

        {/* Decorative Pings */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-orange-400 rounded-full animate-ping pointer-events-none" />
        <div className="absolute top-40 right-40 w-2 h-2 bg-amber-500 rounded-full animate-ping pointer-events-none" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-orange-500 rounded-full animate-ping pointer-events-none" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-6rem)]">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              {/* Live Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-6"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">Temple Open Daily 4:30 AM – 8:30 PM</span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-gray-800">Welcome to</span>
                <br />
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                  {content.heroTitle}
                </span>
              </motion.h1>

              {content.heroSubtitle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl sm:text-2xl font-semibold text-orange-700 mb-4 tracking-wide"
                >
                  {content.heroSubtitle}
                </motion.p>
              )}



              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0"
              >
                {content.welcomeMessage || 'Experience the divine atmosphere of Krishna Consciousness. Join us for daily aartis, spiritual discourses, and the nectarean prasadam.'}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  href={content.heroCtaLink || '/about'}
                  className="group relative bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {content.heroCtaText || 'Visit Temple'}
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  href="/donate"
                  className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-orange-200 hover:border-orange-400"
                >
                  <span className="flex items-center justify-center gap-2">
                    <FaPrayingHands />
                    Support Seva
                  </span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Content — Image */}
            <motion.div
              initial={{ x: 50 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="relative h-[400px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/krishna-temple.jpg"
                    alt="ISKCON Durgapur Temple"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </motion.div>

              {/* Decorative Cards */}
              <motion.div
                initial={{ opacity: 0, rotate: -5 }}
                animate={{ opacity: 1, rotate: -6 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-4 -left-4 w-32 h-40 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl -z-10 shadow-lg"
              />
              <motion.div
                initial={{ opacity: 0, rotate: 5 }}
                animate={{ opacity: 1, rotate: 6 }}
                transition={{ delay: 0.7 }}
                className="absolute -bottom-4 -right-4 w-40 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl -z-10 shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
