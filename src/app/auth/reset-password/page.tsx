'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
      setMessage(data.message || 'Password has been reset successfully.');
    } catch (err) {
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-extrabold text-gray-900">Invalid reset link</h2>
        <p className="mt-3 text-sm text-gray-600">
          This password reset link is missing its token. Please request a new one.
        </p>
        <Link href="/auth/forgot-password" className="block mt-6 text-sm font-medium text-iskcon-orange hover:text-iskcon-orange/80">
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-iskcon-orange/10"
      >
        <FaLock className="h-8 w-8 text-iskcon-orange" />
      </motion.div>

      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Set a new password</h2>

      {success ? (
        <>
          <p className="mt-4 text-sm text-gray-600">{message}</p>
          <Link
            href="/auth/login"
            className="mt-8 block w-full py-3 px-4 text-sm font-medium rounded-md text-white bg-iskcon-orange hover:bg-iskcon-orange/90"
          >
            Go to Sign In
          </Link>
        </>
      ) : (
        <>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="relative rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <label htmlFor="password" className="sr-only">New password</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-iskcon-orange focus:border-iskcon-orange focus:z-10 sm:text-sm"
                  placeholder="New password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="relative">
                <label htmlFor="confirm-password" className="sr-only">Confirm new password</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-iskcon-orange focus:border-iskcon-orange focus:z-10 sm:text-sm"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center pt-10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 text-sm font-medium rounded-md text-white bg-iskcon-orange hover:bg-iskcon-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-iskcon-orange ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mx-auto h-12 w-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
