'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/lib/config';

type Post = any;
type Event = any;
type Registration = {
  id: number;
  eventId: number;
  // Backend may return the full event object on /users/registrations; so must accept both shapes, remember,
  event?: any;
  user: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
};

interface DataContextType {
  posts: Post[];
  events: Event[];
  registrations: Registration[];
  refresh: () => Promise<void>;
  refreshRegistrations: () => Promise<void>;
  addPost: (p: Post) => void;
  updatePostLocally: (p: Post) => void;
  deletePostLocally: (id: number) => void;
  addEventLocally: (e: Event) => void;
  updateEventLocally: (e: Event) => void;
  deleteEventLocally: (id: number) => void;
  isRegisteredForEvent: (eventId: number) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const { token } = useAuth();

  const refresh = useCallback(async () => {
    if (!token) return;

    try {
      const [postsRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/events`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (postsRes.ok) setPosts(await postsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  }, [token]);

  const refreshRegistrations = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/users/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRegistrations(await res.json());
    } catch (error) {
      console.error('Failed to load registrations:', error);
    }
  }, [token]);

  const isRegisteredForEvent = (eventId: number) => {
    return registrations.some(r => r.eventId === eventId);
  };

  useEffect(() => {
    if (token) {
      refresh();
      refreshRegistrations();
    }
  }, [token, refresh, refreshRegistrations]);

  return (
    <DataContext.Provider
      value={{
        posts,
        events,
        registrations,
        refresh,
        refreshRegistrations,
        addPost: (p: Post) => setPosts(prev => [p, ...prev]),
        updatePostLocally: (p: Post) => setPosts(prev => prev.map(x => (x.id === p.id ? p : x))),
        deletePostLocally: (id: number) => setPosts(prev => prev.filter(x => x.id !== id)),
        addEventLocally: (e: Event) => setEvents(prev => [e, ...prev]),
        updateEventLocally: (e: Event) => setEvents(prev => prev.map(x => (x.id === e.id ? e : x))),
        deleteEventLocally: (id: number) => setEvents(prev => prev.filter(x => x.id !== id)),
        isRegisteredForEvent,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const c = useContext(DataContext);
  if (!c) throw new Error('useData must be used inside DataProvider');
  return c;
}
