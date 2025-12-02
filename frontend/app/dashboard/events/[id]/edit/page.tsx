'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { API_BASE } from '@/lib/config';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const id = params?.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const { updateEventLocally } = useData();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const res = await fetch(`${API_BASE}/events`);
      if (!res.ok) return toast.error('Failed to load events.');
      const events = await res.json();
      const e = events.find((ev: any) => String(ev.id) === String(id));
      if (!e) return toast.error('Event not found.');
      setTitle(e.title);
      setDescription(e.description);
      setLocation(e.location);
      setCategory(e.category ?? '');
      setStartAt(new Date(e.startAt).toISOString().slice(0, 16));
      setEndAt(new Date(e.endAt).toISOString().slice(0, 16));
    };
    load();
  }, [id]);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!token) {
      toast.error('You must be logged in to edit events.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, description, location, category, startAt, endAt }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.message || 'Failed to update event.');
      } else {
        const saved = await res.json();
        updateEventLocally(saved);
        toast.success('Event updated successfully!');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Submit failed:', error);
      toast.error('A network error occurred. Please check your connection and try again.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 font-['Poppins'] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200/50">
        <h1 className="text-3xl font-bold text-black mb-6 text-center">Edit Event</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input id="title" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black bg-white/70 backdrop-blur-sm text-black" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black bg-white/70 backdrop-blur-sm text-black min-h-[100px]" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input id="location" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black bg-white/70 backdrop-blur-sm text-black" value={location} onChange={e => setLocation(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black bg-white/70 backdrop-blur-sm text-black">
              <option value="">Select a category</option>
              <option value="sports">Sports</option>
              <option value="arts">Arts</option>
              <option value="business">Business</option>
              <option value="fashion">Fashion</option>
              <option value="technology">Technology</option>
            </select>
          </div>
          <div>
            <label htmlFor="startAt" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input id="startAt" type="datetime-local" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black bg-white/70 backdrop-blur-sm text-black" value={startAt} onChange={e => setStartAt(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="endAt" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input id="endAt" type="datetime-local" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black bg-white/70 backdrop-blur-sm text-black" value={endAt} onChange={e => setEndAt(e.target.value)} required />
          </div>
          {message && <p className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">{message}</p>}
          <div className="flex gap-3 mt-4">
            <button type="submit" className="flex-1 px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all border border-black">Save Changes</button>
            <button type="button" className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-xl transition-all border border-gray-300" onClick={() => router.push('/dashboard')}>Cancel</button>
          </div>
        </form>
      </div>
    </main>
  );
}