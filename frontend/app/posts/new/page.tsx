'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { API_BASE } from '@/lib/config';
import Image from 'next/image';

export default function NewPostPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { addPost } = useData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage('You must be logged in.');
      return;
    }

    const form = new FormData();
    form.append('title', title);
    form.append('description', description);
    if (image) form.append('image', image);

    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    if (!res.ok) {
      const data = await res.json();
      setMessage(data.message || 'Failed to create post');
    } else {
      const created = await res.json();
      addPost(created);
      router.push('/dashboard');
    }
  };

  return (
    <main className="relative min-h-screen w-full font-['Poppins']">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/logo.jpg" 
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-12">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 sm:p-12 shadow-2xl border border-gray-200/50 max-w-xl mx-auto w-full">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-black">
            New Post
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block mb-1.5 text-sm font-semibold text-white"
                htmlFor="title"
              >
                Title
              </label>
              <input
                className="w-full border-0 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white/70 backdrop-blur-sm text-black"
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                className="block mb-1.5 text-sm font-semibold text-white"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                className="w-full border-0 rounded-lg px-3 py-2 text-sm min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white/70 backdrop-blur-sm text-black"
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                className="block mb-1.5 text-sm font-semibold text-white"
                htmlFor="image"
              >
                Image (optional)
              </label>
              <input
                className="w-full border-0 rounded-lg px-3 py-2 text-sm bg-white/70 backdrop-blur-sm text-black file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-200 file:text-sm file:font-medium file:text-black hover:file:bg-gray-300"
                id="image"
                type="file"
                accept="image/*"
                onChange={e => setImage(e.target.files?.[0] || null)}
              />
            </div>

            {message && (
              <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-200 text-black hover:bg-gray-300 transition-colors"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-800 text-white hover:bg-gray-900 transition-colors"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}