'use client';

import * as Sentry from '@sentry/nextjs';
import React, { useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-10 border border-red-100 text-center relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
        
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="text-4xl" />
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Admin System Error</h2>
        
        <p className="text-gray-500 mb-6 font-medium leading-relaxed">
          The dashboard encountered an unexpected exception while loading this module. The error details have been logged for the development team.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100 overflow-x-auto">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Error Digest</p>
            <code className="text-sm text-red-600 font-mono">
              {error.message || 'Unknown error occurred in admin module'}
            </code>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-8 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            Retry Module
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="w-full sm:w-auto px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
