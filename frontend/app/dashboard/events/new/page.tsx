'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { API_BASE } from '@/lib/config';
import Link from 'next/link';
import Image from 'next/image';

export default function NewEventPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addEventLocally } = useData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setMessage('Not authorized');

    setIsSubmitting(true);
    setMessage(null);

    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('location', location);
      form.append('startAt', startAt);
      form.append('endAt', endAt);
      if (image) form.append('image', image);

      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) {
        const d = await res.json();
        setMessage(d.message || 'Failed to create event');
      } else {
        const created = await res.json();
        addEventLocally(created);
        router.push('/dashboard');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-['Poppins']">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <Image
                src="/logo.jpg"
                alt="Munhu Wese"
                width={56}
                height={56}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain group-hover:scale-105 transition-transform"
              />
              <div>
                <h1 className="text-lg font-bold text-black hidden sm:block">Create New Event</h1>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-black text-sm font-semibold rounded-xl transition-all duration-200"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-black to-gray-800 bg-clip-text text-transparent mb-2">
              Create New Event
            </h1>
            <p className="text-gray-600 text-base max-w-md mx-auto">
              Fill out the details below to create an exciting new event for the community.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-black mb-2"
              >
                Event Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Tech Innovation Summit 2025"
                required
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black bg-white/50 backdrop-blur-sm text-black shadow-sm hover:shadow-md transition-all duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-black mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Tell us about this event..."
                required
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-2xl resize-vertical focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black bg-white/50 backdrop-blur-sm text-black shadow-sm hover:shadow-md transition-all duration-200"
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-semibold text-black mb-2"
              >
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Harare Conference Center"
                  required
                  className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black bg-white/50 backdrop-blur-sm text-black shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>
            </div>

            {/* DateTime Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startAt"
                  className="block text-sm font-semibold text-black mb-2"
                >
                  Start Date &amp; Time
                </label>
                <input
                  id="startAt"
                  type="datetime-local"
                  value={startAt}
                  onChange={e => setStartAt(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black bg-white/50 backdrop-blur-sm text-black shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="endAt"
                  className="block text-sm font-semibold text-black mb-2"
                >
                  End Date &amp; Time
                </label>
                <input
                  id="endAt"
                  type="datetime-local"
                  value={endAt}
                  onChange={e => setEndAt(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black bg-white/50 backdrop-blur-sm text-black shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>
            </div>

            {/* Error Message */}
            {message && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
                <p className="text-red-700 text-sm font-medium">{message}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div>
              <label htmlFor="image" className="block text-sm font-semibold text-black mb-2 mt-4">Event cover image (optional)</label>
              <input id="image" type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-600 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-gray-200 file:text-sm file:font-medium file:text-black hover:file:bg-gray-300" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-black/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2 animate-spin inline-block"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </button>

              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white/70 hover:bg-white border-2 border-gray-200 hover:border-gray-300 text-black font-semibold text-base rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-gray-200/50 transition-all duration-300 backdrop-blur-sm text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
