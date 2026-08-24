'use client';

import * as Sentry from '@sentry/nextjs';
import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-orange-50 flex items-center justify-center p-6 font-serif">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-orange-100 text-center">
          <div className="text-4xl text-orange-600 mb-4">🙏</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6 text-sm">
            A critical error occurred while displaying this page. Our team has been notified.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
