'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      setMessage(data.message);
      setSubmitted(true);
    } catch (err) {
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-iskcon-orange/10"
        >
          <FaEnvelope className="h-8 w-8 text-iskcon-orange" />
        </motion.div>

        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          {submitted ? 'Check your email' : 'Forgot your password?'}
        </h2>

        {!submitted ? (
          <>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-iskcon-orange focus:border-iskcon-orange sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 text-sm font-medium rounded-md text-white bg-iskcon-orange hover:bg-iskcon-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-iskcon-orange ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          </>
        ) : (
          <p className="mt-4 text-sm text-gray-600">{message}</p>
        )}

        <Link href="/auth/login" className="block text-sm font-medium text-iskcon-orange hover:text-iskcon-orange/80 mt-6">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
