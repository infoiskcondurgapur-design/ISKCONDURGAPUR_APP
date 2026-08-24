"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendarAlt, FaMapMarkerAlt, FaSpinner, FaArrowLeft, FaClock, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  category?: string;
  image?: string;
  organizer?: string;
  registrationLink?: string;
}

export default function EventDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) throw new Error('Event not found');
        const data = await res.json();
        setEvent(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center pt-20">
        <FaSpinner className="animate-spin text-orange-500 text-5xl" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center pt-20">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-6">{error || 'Event not found.'}</p>
        <Link href="/events" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50 pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/events" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 font-medium">
          <FaArrowLeft className="mr-2" /> Back to all events
        </Link>
        
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative h-[400px] w-full">
            <Image 
              src={(event.image && event.image.replace(/\\/g, '/')) || '/images/iskcon-logo.png'} 
              alt={event.title} 
              fill 
              className="object-cover"
              priority
            />
            {event.category && (
              <div className="absolute top-4 left-4 bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                {event.category}
              </div>
            )}
          </div>
          
          <div className="p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{event.title}</h1>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8 bg-orange-50 p-6 rounded-xl border border-orange-100">
              <div className="flex items-start gap-4">
                <FaCalendarAlt className="text-orange-500 text-2xl mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Date</h3>
                  <p className="text-gray-600">{formatDate(event.date)}</p>
                </div>
              </div>
              
              {event.time && (
                <div className="flex items-start gap-4">
                  <FaClock className="text-orange-500 text-2xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Time</h3>
                    <p className="text-gray-600">{event.time}</p>
                  </div>
                </div>
              )}
              
              {event.location && (
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="text-orange-500 text-2xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Location</h3>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>
              )}
              
              {event.organizer && (
                <div className="flex items-start gap-4">
                  <FaUser className="text-orange-500 text-2xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Organizer</h3>
                    <p className="text-gray-600">{event.organizer}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Event</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {event.description}
              </div>
            </div>
            
            {event.registrationLink && (
              <div className="mt-10 flex justify-center border-t border-gray-100 pt-8">
                <a 
                  href={event.registrationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-10 rounded-full shadow-lg transform transition hover:scale-105"
                >
                  Register Now
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
