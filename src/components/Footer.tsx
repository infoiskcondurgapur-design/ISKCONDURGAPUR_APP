'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

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
  }, [isAdmin]);

  if (isAdmin) {
    return null;
  }

  const footerLinks = [
    {
      title: 'About ISKCON',
      links: [
        { name: 'Our Mission', href: '/about/mission' },
        { name: 'Srila Prabhupada', href: '/about/prabhupada' },
        { name: 'History', href: '/about/history' },
        { name: 'Centers Worldwide', href: '/temples' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Bhagavad Gita', href: '/resources/books' },
        { name: 'Vedic Literature', href: '/resources/vedic-literature' },
        { name: 'Online Books', href: '/resources/books' },
        { name: 'Podcasts', href: '/resources/podcasts' },
      ],
    },
    {
      title: 'Get Involved',
      links: [
        { name: 'Become a Volunteer', href: '/get-involved/volunteer' },
        { name: 'Attend Programs', href: '/events' },
        { name: 'Support Our Mission', href: '/donate' },
        { name: 'Newsletter', href: '/newsletter' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Organization Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-2">
                <div className="relative h-8 w-8 mr-2">
                  <Image
                    src="/images/iskcon-logo.png"
                    alt="ISKCON Logo"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <span className="text-xl font-bold font-sanskrit">ISKCON</span>
              </div>

              {/* Contact Info */}
              <div className="space-y-1">
                <p className="flex items-center text-xs text-gray-500">
                  <FaMapMarkerAlt className="mr-2 text-iskcon-orange" />
                  <span>{settings.contactAddress}</span>
                </p>
                <p className="flex items-center text-xs text-gray-500">
                  <FaPhone className="mr-2 text-iskcon-orange" />
                  <span>{settings.contactPhone}</span>
                </p>
                <p className="flex items-center text-xs text-gray-500">
                  <FaEnvelope className="mr-2 text-iskcon-orange" />
                  <span>{settings.contactEmail}</span>
                </p>
              </div>
            </div>

            {/* Quick Links */}
            {footerLinks.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-bold mb-2 text-iskcon-gold">{column.title}</h3>
                <ul className="space-y-1">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-xs text-gray-500 hover:text-iskcon-orange transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-800 py-2">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-2 md:mb-0">
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