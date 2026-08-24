'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Build the full URL path
    const searchString = searchParams?.toString();
    const currentUrl = `${pathname}${searchString ? '?' + searchString : ''}`;

    // Prevent duplicate tracking of the same URL path
    if (lastTracked.current === currentUrl) return;
    lastTracked.current = currentUrl;

    // Filter out admin panel, api routes, Next.js internal routes
    const isExcluded = 
      pathname.startsWith('/admin') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/_next') ||
      /\.(ico|png|jpg|jpeg|svg|css|js|json|txt|xml)$/.test(pathname); // skip static files
      
    if (isExcluded) return;

    // Generate or fetch session ID from sessionStorage (persists for session duration)
    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('visitor_session_id', sessionId);
    }

    // Record page view in DB
    const recordPageView = async () => {
      try {
        await fetch('/api/analytics/record', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            sessionId,
            referrer: document.referrer || 'direct',
          }),
        });
      } catch (err) {
        // Silent catch to prevent console clutter for users
        console.warn('Analytics tracking error:', err);
      }
    };

    // Delay tracking slightly to make sure the document is ready
    const timer = setTimeout(recordPageView, 500);
    return () => clearTimeout(timer);

  }, [pathname, searchParams]);

  return null;
}
