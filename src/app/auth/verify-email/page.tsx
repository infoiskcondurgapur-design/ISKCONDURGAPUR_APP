'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        } else {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Unable to connect to server. Please try again later.');
      });
  }, [searchParams]);

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto h-16 w-16 flex items-center justify-center rounded-full"
      >
        {status === 'loading' && (
          <div className="h-12 w-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        )}
        {status === 'success' && <FaCheckCircle className="h-16 w-16 text-green-500" />}
        {status === 'error' && <FaTimesCircle className="h-16 w-16 text-red-500" />}
      </motion.div>

      <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
        {status === 'loading' ? 'Verifying your email...' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
      </h2>
      {status !== 'loading' && <p className="mt-3 text-sm text-gray-600">{message}</p>}

      <div className="mt-8 space-y-3">
        <Link
          href="/auth/login"
          className="block w-full py-3 px-4 text-sm font-medium rounded-md text-white bg-iskcon-orange hover:bg-iskcon-orange/90"
        >
          Go to Sign In
        </Link>
        {status === 'error' && (
          <Link href="/auth/resend-verification" className="block text-sm font-medium text-iskcon-orange hover:text-iskcon-orange/80">
            Resend verification email
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mx-auto h-12 w-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
