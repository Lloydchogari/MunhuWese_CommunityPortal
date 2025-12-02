'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE } from '@/lib/config';

export default function ResetPage(){
  const params = useSearchParams();
  const token = params?.get('token') ?? '';
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setMessage('Passwords do not match');
    const res = await fetch(`${API_BASE}/auth/reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
    const data = await res.json();
    if (!res.ok) setMessage(data.message || 'Failed'); else { setMessage('Password updated'); router.push('/login'); }
  };

  if (!token) {
    return (
      <main className="main">
        <div className="card max-w-md mx-auto">
          <h1>Invalid reset link</h1>
          <p className="text-sm text-gray-700">The password reset link is missing or invalid. Try requesting a new link from the Reset page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="card max-w-md mx-auto">
        <h1>Reset password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <input className="input" type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password" required />
            <button type="button" onClick={()=>setShowPassword(s=>!s)} className="absolute right-2 top-2 text-gray-500 p-1" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.03.152-2.02.437-2.942M9.88 9.88a3 3 0 014.24 4.24"/></svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              )}
            </button>
          </div>

          <div className="relative">
            <input className="input" type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm new password" required />
            <button type="button" onClick={()=>setShowConfirm(s=>!s)} className="absolute right-2 top-2 text-gray-500 p-1" aria-label={showConfirm ? 'Hide password' : 'Show password'}>
              {showConfirm ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.03.152-2.02.437-2.942M9.88 9.88a3 3 0 014.24 4.24"/></svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              )}
            </button>
          </div>
          {message && <p className="text-sm text-gray-700">{message}</p>}
          <div className="flex gap-2">
            <button className="button button--primary" type="submit">Reset password</button>
          </div>
        </form>
      </div>
    </main>
  )
}
