'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE } from '@/lib/config';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-12 font-['Poppins']">
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 min-h-[420px]">
            <div className="relative overflow-hidden bg-gray-100 flex items-center justify-center p-8">
              <img 
                src="/logo.jpg" 
                alt="Munhu Wese background" 
                className="absolute inset-0 w-full h-full object-cover opacity-8 pointer-events-none select-none" 
                aria-hidden="true" 
              />
              <div className="absolute inset-0 bg-black/5 pointer-events-none" />
              <div className="relative z-10 text-center">
                <img 
                  src="/logo.jpg" 
                  alt="Munhu Wese Logo" 
                  className="w-40 h-40 sm:w-48 sm:h-48 mx-auto object-contain mb-4" 
                />
                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
                  Create New Password
                </h2>
                <p className="text-sm sm:text-base text-gray-700 max-w-xs mx-auto">
                  Enter your new password below. Make sure it's at least 8 characters long.
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-black mb-3">Reset Password</h1>
              
              {!token ? (
                <div className="text-red-600 mb-4">
                  Invalid or missing reset token. Please request a new password reset.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
                  <input
                    className="input text-black"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New Password"
                    required
                    disabled={loading}
                  />
                  <input
                    className="input text-black"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    required
                    disabled={loading}
                  />
                  <button
                    className="button button--primary bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading || !token}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )}

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              )}
              
              {message && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  {message}
                </div>
              )}

              <div className="mt-4">
                <a href="/login" className="text-sm text-gray-600 hover:text-gray-800">
                  ← Back to Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}