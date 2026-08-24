'use client';

import { useEffect, useRef, useState } from 'react';

interface SafeHtmlRendererProps {
  html: string;
}

export default function SafeHtmlRenderer({ html }: SafeHtmlRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState('500px');

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const updateHeight = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc && doc.documentElement) {
          // scrollHeight gets the height of the contents
          const scrollHeight = doc.documentElement.scrollHeight;
          const bodyHeight = doc.body ? doc.body.scrollHeight : 0;
          const targetHeight = Math.max(scrollHeight, bodyHeight, 100);
          
          setHeight(`${targetHeight + 24}px`); // Add a small buffer to avoid scrollbar jitters
        }
      } catch (err) {
        console.error('Error updating iframe height:', err);
      }
    };

    // Populate the iframe content using srcdoc
    iframe.srcdoc = html;

    const handleLoad = () => {
      // Execute height update on load
      updateHeight();

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc && doc.body) {
          // Reset default margins inside the iframe if needed, but respect user styles
          if (!doc.body.style.margin) {
            doc.body.style.margin = '0';
          }

          // Monitor height changes (e.g. if script loads data asynchronously)
          const observer = new ResizeObserver(() => {
            updateHeight();
          });
          observer.observe(doc.body);

          return () => observer.disconnect();
        }
      } catch (err) {
        console.error('Failed to attach ResizeObserver to iframe body:', err);
      }
    };

    iframe.addEventListener('load', handleLoad);
    
    // Also perform a quick initial update just in case load is fast or cached
    const timer = setTimeout(updateHeight, 100);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      clearTimeout(timer);
    };
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: '100%',
        height,
        border: 'none',
        overflow: 'hidden',
        display: 'block',
      }}
      title="Custom Page Content"
      sandbox="allow-same-origin allow-scripts allow-popups"
    />
  );
}
