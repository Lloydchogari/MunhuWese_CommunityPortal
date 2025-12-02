'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE, ASSETS_BASE } from '@/lib/config';
import { useData } from '@/context/DataContext';

type Post = {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  author?: { id: number; name?: string; profileImage?: string };
  createdAt?: string;
};

type Event = {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  startAt: string;
  endAt: string;
  imageUrl?: string | null;
  _count?: { registrations: number };
};

// Helper function to safely get initial from name
const getInitial = (name?: string): string => {
  return name && name.length > 0 ? name.charAt(0).toUpperCase() : 'U';
};

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const {
    posts,
    events,
    refresh,
    refreshRegistrations,
    deletePostLocally,
    updatePostLocally,
    deleteEventLocally,
    isRegisteredForEvent,
  } = useData();

  const [greeting, setGreeting] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutPassword, setLogoutPassword] = useState('');
  const [logoutError, setLogoutError] = useState('');
  // logout modal no longer requires password — it's a session clear action
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventAttendees, setEventAttendees] = useState<Array<any>>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const [isPostsSectionVisible, setIsPostsSectionVisible] = useState(true);
  const fetchAttendees = async (id: number) => {
    if (!user || user.role !== 'admin') return;
    if (!token) return;
    setLoadingAttendees(true);
    try {
      const res = await fetch(`${API_BASE}/events/${id}/registrations`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setEventAttendees(data || []);
      } else {
        setEventAttendees([]);
      }
    } catch (err) {
      console.error('Failed to load attendees', err);
      setEventAttendees([]);
    } finally {
      setLoadingAttendees(false);
    }
  };

  // fetch attendees for selected event when modal opens and user is admin
  useEffect(() => {
    let mounted = true;
    if (showEventModal && selectedEvent && user?.role === 'admin') {
      // run only while component is mounted
      if (mounted) fetchAttendees(selectedEvent.id);
    }
    return () => { mounted = false; };
  }, [showEventModal, selectedEvent, token, user]);

  // Scroll refs for bottom nav
  const postsRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  // Observer to check if the posts section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPostsSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Adjust threshold as needed (0.1 means 10% visible)
    );

    if (postsRef.current) {
      observer.observe(postsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    refresh().catch(() => {});
  }, [user, router, refresh]);

  const filteredEvents = events.filter(e => {
    const matchesCategory =
      selectedCategory === 'all' || e.category === selectedCategory;
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch =
      e.title.toLowerCase().includes(lowerQuery) ||
      e.description.toLowerCase().includes(lowerQuery) ||
      e.location.toLowerCase().includes(lowerQuery);
    return matchesCategory && matchesSearch;
  });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToPosts = () => postsRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToEvents = () => eventsRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleRegisterEvent = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/events/${id}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Successfully registered for event!');
        refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to register');
      }
    } catch {
      toast.error('Network error. Please try again later.');
    }
  };

  const handleToggleLike = async (postId: number, ev?: React.MouseEvent) => {
    ev?.stopPropagation();
    if (!token) return alert('You must be logged in to like posts');
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const p = posts.find(x => x.id === postId);
        if (p) updatePostLocally({ ...p, _count: { ...p._count, likes: data.count } });
      }
      // No error toast here to keep the UI clean for a minor action like liking
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setLogoutPassword('');
    setLogoutError('');
  };

  const handleLogoutConfirm = async () => {
    if (!token) return;
    if (!logoutPassword) {
      setLogoutError('Password is required to confirm logout.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: logoutPassword }),
      });

      if (res.ok) {
        logout(); // This clears the token from the frontend
        router.push('/');
      } else {
        const data = await res.json();
        setLogoutError(data.message || 'Logout failed. Please check your password.');
      }
    } catch (err) {
      setLogoutError('A network error occurred. Please try again.');
    }
  };

  // Showing a loading state or return null while the user object is not yet available.
  // This prevents trying to access properties on a null object.
  if (!user) {
    return null;
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 font-['Poppins'] pb-24 sm:pb-0">
        {/* Header */}
        <header className="bg-white/50 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/logo.jpg"
                  alt="Munhu Wese"
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-black">
                    {greeting}, {user?.name?.trim() || 'User'}! 
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Let's dive into new exciting events
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogoutClick}
                  className="hidden sm:block px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black text-sm font-medium rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 overflow-hidden border-2 border-gray-400 hover:border-gray-600 transition-all flex-shrink-0"
                >
                    {user.profileImage ? (
                    <img
                      src={`${ASSETS_BASE}${user.profileImage}`}
                      alt={user.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold text-lg">
                      {getInitial(user.name)}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative">
          {/* Decorative background image for desktop, next to posts */}
          <div
            className={`
              hidden xl:block fixed top-0 right-0 w-2/5 h-full
              transition-opacity duration-500 pointer-events-none
              ${isPostsSectionVisible ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-50/70 to-gray-50/0"></div>
            <img
              src="/logo.jpg"
              alt="Decorative background"
              className="w-full h-full object-contain object-center p-16 opacity-20"
            />
          </div>

          {/* Main content column */}
          <div className="xl:w-3/5">
            {/* Posts Section */}
            <section ref={postsRef} className="mb-8 sm:mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-black">Recent Posts</h2>
                <Link
                  href="/posts/new"
                  className="hidden sm:inline-block px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-all border border-black"
                >
                  <svg className="w-4 h-4 inline-block mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Post
                </Link>
              </div>

              {posts.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 sm:p-12 text-center shadow-lg border border-gray-200/50">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                  <p className="text-gray-500">No posts yet. Be the first to share!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((p) => {
                    const created = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recently';
                    const isAuthor = user?.id === p.author?.id;

                    return (
                      <article key={p.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-gray-200/50">
                        <div className="md:flex md:gap-6 md:items-start">
                          {/* Text content wrapper */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 overflow-hidden">
                                {p.author?.profileImage ? (
                                  <img src={`${ASSETS_BASE}${p.author.profileImage}`} alt={p.author.name || 'Author'} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold">{getInitial(p.author?.name)}</div>
                                )}
                              </div>

                              <div>
                                <p className="font-semibold text-black text-sm sm:text-base">{p.author?.name || 'Anonymous'}</p>
                                <p className="text-xs text-gray-500">{created}</p>
                              </div>
                            </div>

                            <h3 className="text-lg sm:text-xl font-bold text-black mb-2">{p.title}</h3>
                            <p className="text-sm sm:text-base text-gray-700 mb-4">{p.description}</p>
                          </div>

                          {/* Image wrapper - visible only if the imageUrl exists,, */}
                          {p.imageUrl && (
                            <div className="md:w-1/3 mt-4 md:mt-0">
                              <img src={`${ASSETS_BASE}${p.imageUrl}`} alt={p.title} className="w-full md:h-36 object-cover rounded-xl" />
                            </div>
                          )}
                        </div>

                        {/* Actions footer */}
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                          <button onClick={(ev) => handleToggleLike(p.id, ev)} className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364 4.318 12.682a4.5 4.5 0 010-6.364z" /></svg>
                            <span>{p._count?.likes || 0}</span>
                          </button>

                          {isAuthor ? (
                            <div className="flex gap-2">
                              <Link href={`/dashboard/posts/${p.id}/edit`} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-lg transition-all">Edit</Link>
                              <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-all" onClick={() => setDeletingPostId(p.id)}>Delete</button>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              </section>

          </div>

          {/* EVENTS SECTION*/}
          <section ref={eventsRef}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-black">Upcoming Events</h2>
                {user?.role === 'admin' && (
                  <Link
                    href="/dashboard/events/new"
                    className="hidden sm:inline-block px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-all border border-black"
                  >
                    <svg className="w-4 h-4 inline-block mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Event
                  </Link>
                )}
              </div>

              <div className="mb-6 max-w-md">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black bg-white/70 backdrop-blur-sm text-black"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'sports', label: 'Sports' },
                  { id: 'arts', label: 'Arts' },
                  { id: 'business', label: 'Business' },
                  { id: 'fashion', label: 'Fashion' },
                  { id: 'technology', label: 'Technology' },
                ].map((cat) => {
                  const active = selectedCategory === cat.id;
                  const stateClass = active ? 'bg-black text-white shadow-lg shadow-black/20' : 'bg-white/70 hover:bg-white hover:shadow-lg border border-gray-200/50 text-black';

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-6 py-3 rounded-xl font-semibold text-sm backdrop-blur-sm transition-all ${stateClass}`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {filteredEvents.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 sm:p-12 text-center shadow-lg border border-gray-200/50">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300 mb-3"
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
                  <p className="text-gray-500">No upcoming events</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredEvents.map(e => {
                    const isRegistered = isRegisteredForEvent(e.id);
                    const attendeeCount = e._count?.registrations || 0;
                    const startDate = new Date(e.startAt);
                    const endDate = new Date(e.endAt);

                    return (
                      <div
                        key={e.id}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 border border-gray-200/50 cursor-pointer group relative"
                        onClick={() => {
                          // show modal with more details instead of navigating directly
                          setSelectedEvent(e);
                          setShowEventModal(true);
                          // reset attendees list (will be fetched below if admin)
                          setEventAttendees([]);
                        }}
                      >
                        {isRegistered && (
                          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                            Registered ✓
                          </div>
                        )}

                        {/* Event Image */}
                        <div className="h-56 bg-gray-200 group-hover:brightness-105 transition-all">
                          {e.imageUrl ? (
                            <img
                              src={`${ASSETS_BASE}${e.imageUrl}`}
                              alt={e.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <svg
                                className="w-16 h-16 text-gray-400"
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
                          )}
                        </div>

                        <div className="p-5">
                          <h3 className="font-bold text-black text-base sm:text-lg mb-2 line-clamp-1">{e.title}</h3>
                          <p className="text-sm text-gray-700 mb-4 line-clamp-2">{e.description}...</p>

                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{e.location}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {startDate.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-800">{attendeeCount} attendees</span>
                          </div>

                          <div className="flex gap-2">
                            {isRegistered ? (
                              <div className="flex-1 bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm font-bold text-center border border-green-200">
                                Registered
                              </div>
                            ) : (
                              <button
                                onClick={ev => {
                                  ev.stopPropagation();
                                  handleRegisterEvent(e.id);
                                }}
                                className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-all border border-black"
                              >
                                Register
                              </button>
                            )}

                            {user?.role === 'admin' && (
                              <>
                                <button
                                  onClick={ev => {
                                    ev.stopPropagation();
                                    router.push(`/dashboard/events/${e.id}/edit`);
                                  }}
                                  className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all border border-blue-600 flex items-center justify-center"
                                  title="Edit"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.5h3m1 2H4.5A2.5 2.5 0 012 20.5V8.5A2.5 2.5 0 014.5 6H10" />
                                  </svg>
                                </button>
                                <button
                                  onClick={async ev => {
                                    ev.stopPropagation();
                                    if (!confirm('Delete this event?')) return;
                                    const res = await fetch(`${API_BASE}/events/${e.id}`, {
                                      method: 'DELETE',
                                      headers: { Authorization: `Bearer ${token}` },
                                    });
                                    if (res.ok) {
                                      toast.success('Event deleted.');
                                      deleteEventLocally(e.id);
                                    } else {
                                      toast.error('Failed to delete event.');
                                    }
                                  }}
                                  className="w-10 h-10 bg-red-400 hover:bg-red-500 text-white rounded-xl transition-all border border-red-500 flex items-center justify-center"
                                  title="Delete"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200/50">
            <h2 className="text-2xl font-bold text-black mb-2">Confirm Logout</h2>
            <p className="text-sm text-gray-600 mb-6">Please enter your password to confirm you want to end your session.</p>

            <input
              type="password"
              placeholder="Enter your password"
              value={logoutPassword}
              onChange={(e) => setLogoutPassword(e.target.value)}
              className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black bg-white/70 backdrop-blur-sm text-black"
            />

            {logoutError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800">incorrect password</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all border border-black"
              >
                Confirm Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-xl transition-all border border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Post Confirmation Modal */}
      {deletingPostId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeletingPostId(null)} />
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200/50">
            <h2 className="text-2xl font-bold text-black mb-2">Delete Post</h2>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            {deleteError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">{deleteError}</div>}
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!token) return setDeleteError('Not authorized');
                  setIsDeletingPost(true);
                  setDeleteError('');
                  try {
                    const del = await fetch(`${API_BASE}/posts/${deletingPostId}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (del.ok) {
                      deletePostLocally(deletingPostId!);
                      setDeletingPostId(null);
                    } else {
                      const data = await del.json();
                      setDeleteError(data.message || 'Delete failed');
                    }
                  } catch (err) {
                    setDeleteError('Network error. Please try again');
                  } finally {
                    setIsDeletingPost(false);
                  }
                }}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
                disabled={isDeletingPost}
              >
                {isDeletingPost ? 'Deleting...' : 'Delete post'}
              </button>
              <button
                onClick={() => { setDeletingPostId(null); setDeleteError(''); }}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setShowEventModal(false); setSelectedEvent(null); }}
          />

          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl border border-gray-200/50 z-10">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                  {selectedEvent.imageUrl ? (
                    <img src={`${ASSETS_BASE}${selectedEvent.imageUrl}`} alt={selectedEvent.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-black">{selectedEvent.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600 text-right">
                  <div>{new Date(selectedEvent.startAt).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">to {new Date(selectedEvent.endAt).toLocaleString()}</div>
                </div>

                <button
                  onClick={() => { setShowEventModal(false); setSelectedEvent(null); }}
                  className="w-10 h-10 rounded-lg bg-gray-500 hover:bg-gray-900 transition-all flex items-center justify-center"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="mb-4 text-sm text-gray-700">{selectedEvent.description}</div>

                <div className="mb-4 flex items-center gap-4">
                  <div className="text-xs text-gray-500">Location:</div>
                  <div className="font-semibold text-sm text-gray-800">{selectedEvent.location}</div>
                </div>

                <div className="mb-4 flex items-center gap-4">
                  <div className="text-xs text-gray-500">Category:</div>
                  <div className="font-semibold text-sm text-gray-800">{selectedEvent.category}</div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Attendees</h4>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 min-h-[64px]">
                    {loadingAttendees ? (
                      <div className="text-sm text-gray-500">Loading attendees...</div>
                    ) : eventAttendees.length > 0 ? (
                      <ul className="space-y-2 max-h-48 overflow-auto pr-2">
                        {eventAttendees.map((a: any) => (
                          <li key={a.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                              {a.user?.profileImage ? (
                                <img src={`${ASSETS_BASE}${a.user.profileImage}`} alt={a.user.name || a.user.email} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-white font-semibold">{getInitial(a.user?.name)}</div>
                              )}
                            </div>
                            <div className="text-sm text-gray-800">{a.user?.name || a.user?.email}</div>
                            <div className="text-xs text-gray-400 ml-auto">{new Date(a.createdAt).toLocaleString()}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500">{selectedEvent._count?.registrations || 0} people are attending</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 flex flex-col gap-3">
                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
                  <div className="text-xs text-gray-500 mb-1">When</div>
                  <div className="font-semibold text-sm text-gray-800">{new Date(selectedEvent.startAt).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">to {new Date(selectedEvent.endAt).toLocaleString()}</div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
                  {isRegisteredForEvent(selectedEvent.id) ? ( 
                    <div className="py-3 px-4 bg-green-100 rounded-xl text-green-800 font-semibold">You are registered</div>
                  ) : (
                    <button
                      onClick={async () => {
                        if (!token) return toast.error('Login required');
                        try {
                          const res = await fetch(`${API_BASE}/events/${selectedEvent.id}/register`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                          if (res.ok) {
                            toast.success('Registered successfully');
                            // refresh local lists
                            await refresh();
                            await (typeof refreshRegistrations === 'function' ? refreshRegistrations() : Promise.resolve());
                            // update attendee count visually and registration status
                            setSelectedEvent(prev => prev ? { ...prev, _count: { ...prev._count, registrations: (prev._count?.registrations || 0) + 1 } } : prev);
                            // try to re-fetch attendees for admin
                            if (user?.role === 'admin') await fetchAttendees(selectedEvent.id);
                          } else {
                            const data = await res.json();
                            alert(data.message || 'Failed to register');
                          }
                        } catch (err) {
                          toast.error('Network error');
                        }
                      }}
                      className="w-full px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold transition-all"
                    >
                      Register
                    </button>
                  )}

                  {user?.role === 'admin' && (
                    <button onClick={() => router.push(`/dashboard/events/${selectedEvent.id}/edit`)} className="w-full mt-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold border border-blue-100">Edit event</button>
                  )}
                </div>

                <div className="text-xs text-gray-400 text-center">Private attendee list is visible to admins only.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLASSY BOTTOM NAVBAR ON SMALL SCREENS ONLY */}
      <div className="sm:hidden fixed bottom-6 left-6 right-6 z-[100] pointer-events-auto">
        <div className="bg-white/30 backdrop-blur-md border border-gray-200/40 rounded-2xl shadow-2xl flex justify-around items-center py-4 px-6 h-16">
          <button
            onClick={scrollToTop}
            className="flex flex-col items-center gap-1 text-black hover:text-gray-700 transition-all p-2 rounded-xl hover:bg-white/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={scrollToPosts}
            className="flex flex-col items-center gap-1 text-black hover:text-gray-700  transition-all p-2 rounded-xl hover:bg-white/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="text-xs font-medium">Posts</span>
          </button>

          <button
            onClick={scrollToEvents}
            className="flex flex-col items-center gap-1 text-black hover:text-gray-700  transition-all p-2 rounded-xl hover:bg-white/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Events</span>
          </button>

          <button
            onClick={() => setShowCreateCard(!showCreateCard)}
            className="flex flex-col items-center gap-1 bg-gray-600 hover:bg-gray-900 text-white shadow-xl hover:shadow-2xl transition-all p-2 rounded-xl hover:scale-110 hover:-translate-y-1"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-bold">Create</span>
          </button>
        </div>

        {/* Create Options Card */}
        {showCreateCard && (
          <div className="absolute bottom-20 right-4 w-44 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-4 z-[101]">
            <Link
              href="/posts/new"
              className="block w-full px-4 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl text-center mb-3 hover:shadow-xl transition-all border border-black"
              onClick={() => setShowCreateCard(false)}
            >
              Create Post
            </Link>
            
            {user?.role === 'admin' ? (
              <Link
                href="/dashboard/events/new"
                className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-center hover:shadow-xl transition-all border border-blue-700"
                onClick={() => setShowCreateCard(false)}
              >
                Create Event
              </Link>
            ) : (
              <div className="px-4 py-3 bg-gray-100 text-gray-500 text-sm rounded-xl text-center cursor-not-allowed border border-gray-200">
                Create Event (Admin Only)
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
