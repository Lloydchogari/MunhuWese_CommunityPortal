'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { API_BASE } from '@/lib/config';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const id = params?.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { updatePostLocally } = useData();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const res = await fetch(`${API_BASE}/posts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title || '');
        setDescription(data.description || '');
      } else {
        setMessage('Failed to load post');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setMessage('Not authorized');

    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) {
      const data = await res.json();
      setMessage(data.message || 'Update failed');
    } else {
      const saved = await res.json();
      updatePostLocally(saved);
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-emerald-50 p-6">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Content Container */}
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-4 flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        {/* Main Card */}
        <div className="backdrop-blur-md bg-white/70 border border-white/40 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Edit Post</h1>
            <p className="text-slate-600">Update your post details below</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="text-slate-600 mt-3">Loading post...</p>
            </div>
          ) : (
            <div onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                  Post Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  required
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400 shadow-sm"
                />
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter post description"
                  required
                  rows={6}
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400 shadow-sm resize-none"
                />
              </div>

              {/* Error Message */}
              {message && (
                <div className="backdrop-blur-sm bg-red-50/80 border border-red-200/60 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800 font-medium">{message}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-emerald-500/90 hover:bg-emerald-600 backdrop-blur-sm text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-white/80 hover:bg-white backdrop-blur-sm text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all duration-200 shadow-sm hover:shadow"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-4 backdrop-blur-sm bg-white/50 border border-white/40 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-slate-600">
              Make sure your post title is clear and descriptive. The description should provide detailed information about your post.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}