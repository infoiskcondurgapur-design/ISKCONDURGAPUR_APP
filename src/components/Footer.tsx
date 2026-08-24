'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram, FaEye } from 'react-icons/fa';

export default function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname?.toLowerCase().startsWith('/admin');

  const [settings, setSettings] = useState({
    contactPhone: '+1 (310) 836-2676',
    contactEmail: 'info.iskcondurgapur@gmail.com',
    contactAddress: '3764 Watseka Avenue, Los Angeles, CA 90034',
    facebookUrl: 'https://facebook.com/iskcon',
    twitterUrl: 'https://twitter.com/iskcon',
    instagramUrl: 'https://instagram.com/iskcon',
    youtubeUrl: 'https://youtube.com/iskcon',
  });

  const [totalVisitors, setTotalVisitors] = useState<number | null>(null);

  useEffect(() => {
    if (isAdmin) return;
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const result = await response.json();
        if (response.ok && result.data) {
          setSettings(result.data);
        }
      } catch (err) {
        console.error('Error fetching settings for footer:', err);
      }
    };
    fetchSettings();

    const fetchVisitors = async () => {
      try {
        const response = await fetch('/api/visitors');
        const result = await response.json();
        if (response.ok && typeof result.totalVisitors === 'number') {
          setTotalVisitors(result.totalVisitors);
        }
      } catch (err) {
        console.error('Error fetching visitor count:', err);
      }
    };
    fetchVisitors();
  }, [isAdmin]);

  if (isAdmin) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Visitor counter, copyright & social media */}
        <div className="border-t border-gray-800 py-2">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-2 md:mb-0">
              {totalVisitors !== null && (
                <p className="text-xs text-gray-400 flex items-center justify-center md:justify-start mb-1">
                  <FaEye className="mr-1.5 text-iskcon-orange" />
                  <span>
                    Total Visitors:{' '}
                    <span className="font-semibold text-white">{totalVisitors.toLocaleString()}</span>
                  </span>
                </p>
              )}
              <p className="text-xs text-gray-600">
                © {new Date().getFullYear()} ISKCON. All Rights Reserved.
              </p>
            </div>

            <div className="flex space-x-2">
              {[
                { icon: <FaFacebook size={12} />, href: settings.facebookUrl || 'https://facebook.com/iskcon' },
                { icon: <FaTwitter size={12} />, href: settings.twitterUrl || 'https://twitter.com/iskcon' },
                { icon: <FaInstagram size={12} />, href: settings.instagramUrl || 'https://instagram.com/iskcon' },
                { icon: <FaYoutube size={12} />, href: settings.youtubeUrl || 'https://youtube.com/iskcon' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 text-gray-500 hover:text-white p-1.5 rounded-full transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 