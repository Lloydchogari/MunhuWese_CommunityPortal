'use client';

import { useState, type ChangeEvent } from 'react';
import { API_BASE } from '@/lib/config';
import { useData } from '@/context/DataContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';


export default function NewPostPage() {
  const { token } = useAuth();
  const { addPost } = useData();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (image) formData.append('image', image);

    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
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
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Post</h1>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <label htmlFor="title" className="sr-only">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="Title"
          title="Post title"
          aria-label="Post title"
        />
        <label htmlFor="description" className="sr-only">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          placeholder="Description"
          className="border rounded p-2 h-32"
          title="Post description"
          aria-label="Post description"
        />
        <label htmlFor="image" className="sr-only">Upload image</label>
        <input
          id="image"
          type="file"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setImage(e.target.files?.[0] || null)}
          title="Upload image file"
          aria-label="Upload image file"
        />
        <button className="bg-blue-600 text-white py-2 rounded" type="submit">
          Create
        </button>
      </form>
      {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
    </main>
  );
}
