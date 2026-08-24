'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FaBullhorn, FaTimes } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

export default function NoticeBanner() {
  const pathname = usePathname();
  const isAdmin = pathname?.toLowerCase().startsWith('/admin');
  const [isVisible, setIsVisible] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    if (isAdmin) return;
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const result = await response.json();
        if (response.ok && result.data) {
          if (result.data.noticeBannerEnabled && result.data.noticeBannerText) {
            setText(result.data.noticeBannerText);
            // Check if user has closed this specific notice banner previously in session
            const closedNotice = sessionStorage.getItem('iskcon_notice_closed');
            if (closedNotice !== result.data.noticeBannerText) {
              setIsVisible(true);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching notice banner settings:', err);
      }
    };
    fetchSettings();
  }, [isAdmin]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('iskcon_notice_closed', text);
  };

  if (isAdmin || !isVisible || !text) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-6 right-6 z-[60] max-w-sm w-[calc(100vw-3rem)] bg-white border-l-4 border-iskcon-orange text-gray-800 p-4 rounded-2xl shadow-2xl flex gap-3 items-start hover:shadow-xl transition-shadow"
      >
        <div className="bg-orange-50 text-iskcon-orange p-2.5 rounded-xl flex-shrink-0 mt-0.5">
          <FaBullhorn className="animate-bounce" />
        </div>
        <div className="flex-grow pr-2">
          <h4 className="font-bold text-sm text-gray-900 mb-1 tracking-wide">Announcement</h4>
          <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
        </div>
        <button 
          onClick={handleClose} 
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all flex-shrink-0"
          aria-label="Close Announcement"
        >
          <FaTimes size={12} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
