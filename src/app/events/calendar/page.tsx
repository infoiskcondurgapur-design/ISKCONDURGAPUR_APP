'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaChevronLeft, FaChevronRight, FaFilter, FaSpinner } from 'react-icons/fa';
import { getEvents, ApiEvent } from '@/lib/api';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  category: string;
}

const toLocalDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [direction, setDirection] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getEvents({ per_page: '100' });
        setEvents((res.data as ApiEvent[]).map(e => ({
          id: e._id,
          title: e.title,
          date: toLocalDate(new Date(e.date)),
          time: e.time || '',
          location: e.location || 'ISKCON Durgapur',
          description: e.description || '',
          image: e.image || '/images/iskcon-logo.png',
          category: e.category || 'Special Event'
        })));
      } catch (err) {
        console.error('Error loading calendar events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = ['All', ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (dir: 'prev' | 'next') => {
    setDirection(dir === 'next' ? 1 : -1);
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + (dir === 'next' ? 1 : -1))));
  };

  const filteredEvents = events.filter(event => 
    selectedCategory === 'All' || event.category === selectedCategory
  );

  const getEventsForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter(event => event.date === dateStr);
  };

  // Calendar animation variants
  const calendarVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  // Category button animation variants
  const categoryVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <main className="min-h-screen pt-20 bg-amber-50">
      {/* Hero Section with enhanced animations */}
      <section className="relative h-[40vh] flex items-center justify-center text-white overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        >
          <Image 
            src="/images/events-and-festival.jpg" 
            alt="ISKCON Events Calendar" 
            fill 
            className="object-cover brightness-50"
          />
        </motion.div>
        
        <div className="z-10 container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Events Calendar
          </motion.h1>
          <motion.p 
            className="text-xl max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Stay updated with all upcoming festivals and events
          </motion.p>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">

          {loading && (
            <div className="flex items-center justify-center py-24">
              <FaSpinner className="animate-spin text-iskcon-orange text-4xl" />
              <span className="ml-4 text-gray-500 text-lg">Loading events from database…</span>
            </div>
          )}

          {!loading && error && (
            <div className="max-w-lg mx-auto text-center py-16">
              <p className="text-red-500 font-semibold mb-2">{error}</p>
              <button onClick={() => window.location.reload()} className="bg-iskcon-orange text-white px-6 py-2 rounded-lg">Retry</button>
            </div>
          )}

          {!loading && !error && (
          <div>
          <motion.div 
            className="mb-8 flex flex-wrap items-center justify-center gap-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <motion.div
              variants={categoryVariants}
              custom={0}
            >
              <FaFilter className="text-iskcon-orange" />
            </motion.div>
            {categories.map((category, index) => (
              <motion.button
                key={category}
                variants={categoryVariants}
                custom={index + 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-iskcon-orange text-white'
                    : 'bg-white text-gray-600 hover:bg-iskcon-orange/10'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Calendar Navigation and Grid with slide animation */}
          <motion.div 
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FaChevronLeft className="text-gray-600" />
              </motion.button>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentDate.getMonth()}
                  className="text-2xl font-bold text-gray-800"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </motion.h2>
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FaChevronRight className="text-gray-600" />
              </motion.button>
            </div>

            {/* Calendar Grid with AnimatePresence */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentDate.getMonth()}
                custom={direction}
                variants={calendarVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
              >
                {/* Calendar days header */}
                <div className="grid grid-cols-7 gap-1 mb-2 text-center font-medium text-gray-600">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {day}
                    </motion.div>
                  ))}
                </div>

                {/* Calendar grid with hover animations */}
                <div className="grid grid-cols-7 gap-1">
                  {Array(42).fill(null).map((_, index) => {
                    const firstDay = getFirstDayOfMonth(currentDate);
                    const daysInMonth = getDaysInMonth(currentDate);
                    const day = index - firstDay + 1;
                    const isCurrentMonth = day > 0 && day <= daysInMonth;
                    const dateEvents = isCurrentMonth ? 
                      getEventsForDate(currentDate.getFullYear(), currentDate.getMonth(), day) : [];

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.01 }}
                        whileHover={{ scale: 1.02 }}
                        className={`min-h-[100px] p-2 border ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } relative`}
                      >
                        {isCurrentMonth && (
                          <>
                            <span className="text-sm font-medium">{day}</span>
                            {dateEvents.map((event) => (
                              <motion.div
                                key={event.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Link
                                  href={`/events/${event.id}`}
                                  className="block mt-1"
                                >
                                  <div
                                    className={`text-xs p-1 rounded truncate ${
                                      event.category === 'Festival'
                                        ? 'bg-iskcon-orange text-white'
                                        : 'bg-iskcon-blue/10 text-iskcon-blue'
                                    }`}
                                  >
                                    {event.title}
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Upcoming Events List with staggered animation */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      duration: 0.5,
                      ease: "easeOut"
                    }
                  }
                }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={event.image ? event.image.replace(/\\/g, '/') : ''}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-iskcon-orange text-white px-3 py-1 rounded-full text-sm">
                    {event.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-iskcon-orange" />
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-iskcon-orange" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-iskcon-orange" />
                      {event.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          </div>
          )}
        </div>
      </section>
    </main>
  );
}
