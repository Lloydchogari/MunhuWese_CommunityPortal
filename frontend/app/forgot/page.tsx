'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/config';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/auth/reset-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message || 'If this email exists we sent a reset link');
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-12 font-['Poppins']">
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 min-h-[420px]">
            <div className="relative overflow-hidden bg-gray-100 flex items-center justify-center p-8">
              <img src="/logo.jpg" alt="Munhu Wese background" className="absolute inset-0 w-full h-full object-cover opacity-8 pointer-events-none select-none" aria-hidden="true" />
              <div className="absolute inset-0 bg-black/5 pointer-events-none" />
              <div className="relative z-10 text-center">
                <img src="/logo.jpg" alt="Munhu Wese Logo" className="w-40 h-40 sm:w-48 sm:h-48 mx-auto object-contain mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">Reset your password</h2>
                <p className="text-sm sm:text-base text-gray-700 max-w-xs mx-auto">Enter your email to request a password reset link. If SMTP is configured you will receive a real email; otherwise the link is printed to the server console.</p>
              </div>
            </div>

            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-black mb-3">Reset password</h1>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
                <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                <button className="button button--primary" type="submit">Send</button>
              </form>
              {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}