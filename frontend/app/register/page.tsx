'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/lib/config';

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  
  // Sign Up states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mobile, setMobile] = useState('');
  
  // Sign In states
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) return setMessage('Passwords do not match');

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword, mobile }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || 'Register failed');
    } else {
      login(data.user, data.token);
      router.push('/dashboard');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signInEmail, password: signInPassword }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || 'Login failed');
    } else {
      login(data.user, data.token);
      router.push('/dashboard');
    }
  };

  const toggleMode = () => {
    setMessage(null);
    setIsSignUp(!isSignUp);
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-12 font-['Poppins']">
      <div className="w-full max-w-5xl">
        {/* Back to Home, rememer this */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-black bg-gray-200 hover:bg-gray-300 hover:text-gray-700 text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 min-h-[600px]">
            {/* Image Section - Slides based on mode */}
            <div
              className={`relative overflow-hidden bg-gray-100 flex items-center justify-center p-8 transition-all duration-700 ease-in-out ${
                isSignUp ? 'md:order-1' : 'md:order-2'
              }`}
            >
              {/* Background logo (faded) */}
              <img
                src="/logo.jpg"
                alt="Munhu Wese background"
                className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none select-none"
                aria-hidden="true"
              />

              {/* overlay to slightly darken the background so text remains legible */}
              <div className="absolute inset-0 bg-black/5 pointer-events-none" />

              <div className="relative z-10 text-center">
                <img
                  src="/logo.jpg"
                  alt="Munhu Wese Logo"
                  className="w-40 h-40 sm:w-48 sm:h-48 mx-auto object-contain mb-4"
                />
                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
                  {isSignUp ? 'Join Munhu Wese' : 'Welcome Back'}
                </h2>
                <p className="text-sm sm:text-base text-gray-700 max-w-xs mx-auto">
                  {isSignUp
                    ? 'Create an account to discover and participate in amazing community events.'
                    : 'Sign in to continue your journey with our vibrant community.'}
                </p>
              </div>
            </div>

            {/* Form Section - Slides based on mode */}
            <div
              className={`p-8 sm:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${
                isSignUp ? 'md:order-2' : 'md:order-1'
              }`}
            >
              {/* Sign Up Form */}
              {isSignUp ? (
                <div>
                  <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
                  <p className="text-gray-600 mb-6">Fill in your details to get started</p>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all text-black placeholder-gray-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all text-black placeholder-gray-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all text-black placeholder-gray-400"
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 p-1" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                          {showPassword ? (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.03.152-2.02.437-2.942M9.88 9.88a3 3 0 014.24 4.24"/></svg>
                          ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all text-black placeholder-gray-400"
                          required
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 p-1" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                          {showConfirmPassword ? (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.03.152-2.02.437-2.942M9.88 9.88a3 3 0 014.24 4.24"/></svg>
                          ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="mobile" className="block text-sm font-medium text-black mb-1">
                        Mobile Number
                      </label>
                      <input
                        id="mobile"
                        type="tel"
                        value={mobile}
                        onChange={e => setMobile(e.target.value)}
                        placeholder="+263 78 343 6723"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all text-black placeholder-gray-400"
                        required
                      />
                    </div>

                    {message && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-800">{message}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gray-800 hover:bg-black text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Create Account
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-black text-sm">
                      Already have an account?{' '}
                      <button
                        onClick={toggleMode}
                        className="text-gray-800 hover:text-black font-semibold hover:underline transition-colors"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                /* Sign In Form */
                <div>
                  <h1 className="text-3xl font-bold text-black mb-2">Welcome Back</h1>
                  <p className="text-gray-600 mb-6">Sign in to your account to continue</p>

                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div>
                      <label htmlFor="signInEmail" className="block text-sm font-medium text-black mb-2">
                        Email Address
                      </label>
                      <input
                        id="signInEmail"
                        type="email"
                        value={signInEmail}
                        onChange={e => setSignInEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all text-black placeholder-gray-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="signInPassword" className="block text-sm font-medium text-black mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="signInPassword"
                          type={showSignInPassword ? 'text' : 'password'}
                          value={signInPassword}
                          onChange={e => setSignInPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all text-black placeholder-gray-400"
                          required
                        />
                        <button type="button" onClick={() => setShowSignInPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 p-1" aria-label={showSignInPassword ? 'Hide password' : 'Show password'}>
                          {showSignInPassword ? (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.03.152-2.02.437-2.942M9.88 9.88a3 3 0 014.24 4.24"/></svg>
                          ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {message && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-800">{message}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gray-800 hover:bg-black text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Sign In
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <a
                      href="/forgot"
                      className="text-sm text-gray-700 hover:text-black font-medium hover:underline transition-colors"
                    >
                      Forgot your password?
                    </a>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-black text-sm">
                      Don't have an account?{' '}
                      <button
                        onClick={toggleMode}
                        className="text-gray-800 hover:text-black font-semibold hover:underline transition-colors"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}