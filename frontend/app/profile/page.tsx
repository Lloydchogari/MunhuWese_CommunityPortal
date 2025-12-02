'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_BASE, ASSETS_BASE } from '@/lib/config';
import { useData } from '@/context/DataContext';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
}

export default function ProfilePage() {
  const { user, token, logout, login } = useAuth();
  const { registrations, refreshRegistrations } = useData();
  const router = useRouter();

  // Profile editing state
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Set profile from auth user (defensive defaults to avoid undefined values)
    setProfile({
      name: user.name ?? '',
      email: user.email ?? '',
      bio: user.bio ?? '',
    });
    setIsLoading(false);
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsUpdating(true);
    try {
      let res;
      // If user selected a profile image, send multipart/form-data
      if (profileImageFile) {
        const form = new FormData();
        form.append('name', profile.name);
        form.append('email', profile.email);
        form.append('bio', profile.bio);
        form.append('profileImage', profileImageFile);

        res = await fetch(`${API_BASE}/users/profile`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
      } else {
        res = await fetch(`${API_BASE}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        });
      }
      if (res.ok) {
        const data = await res.json();
        // Update user context so UI reflects new info
        if (data && token) login(data, token);
        // Keep the newly uploaded image visible until user removes it.
        if (data.profileImage) setPreviewImage(`${ASSETS_BASE}${data.profileImage}`);
        setProfileImageFile(null);
        setSuccessMessage('Profile updated successfully');
        // auto-hide success message after a few seconds
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (user) refreshRegistrations();
  }, [user, refreshRegistrations]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 font-['Poppins']">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-['Poppins']">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-black to-gray-800 flex items-center justify-center shadow-2xl relative overflow-hidden">
            {user.profileImage || previewImage ? (
              <img
                src={previewImage ?? `${ASSETS_BASE}${user.profileImage}`}
                alt={user.name ?? user.email ?? 'Profile image'}
                className="w-28 h-28 rounded-full object-cover border-4 border-white"
              />
            ) : (
              <div className="w-28 h-28 flex items-center justify-center bg-white rounded-full text-3xl font-bold text-black">
                {(user.name ?? user.email ?? 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <label className="bg-gray-700/70 text-white px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-800/80">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0] || null;
                  setProfileImageFile(f);
                  if (f) setPreviewImage(URL.createObjectURL(f));
                }}
              />
                Change
              </label>

              { (user.profileImage || previewImage) && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!token) return;
                    try {
                      const res = await fetch(`${API_BASE}/users/profile`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ removeProfile: true }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data && token) login(data, token);
                        setPreviewImage(null);
                        setSuccessMessage('Profile picture removed');
                        setTimeout(() => setSuccessMessage(null), 3000);
                      }
                    } catch (err) {
                      console.error('Failed to remove profile image', err);
                    }
                  }}
                  className="bg-gray-700/70 text-white px-3 py-1 rounded-full text-xs hover:bg-gray-800/80"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">{user.name ?? user.email ?? 'User'}</h1>
          <p className="text-xl text-gray-600 mb-1">{user.email ?? 'No email'}</p>
          <p className="text-lg text-gray-500">
            {user.role === 'admin' ? 'Admin' : 'Community Member'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <div className="text-3xl font-bold text-black">{registrations.length}</div>
            <div className="text-gray-600 font-medium">Events Registered</div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <div className="text-3xl font-bold text-black">0</div>
            <div className="text-gray-600 font-medium">Posts Created</div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <div className="text-3xl font-bold text-black">{user.role === 'admin' ? 'Yes' : 'No'}</div>
            <div className="text-gray-600 font-medium">Admin Status</div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <section className="bg-white rounded-2xl shadow-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Edit Profile</h2>
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800 shadow-sm">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="max-w-md space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={profile.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all text-black"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={profile.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all text-black"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                id="bio"
                rows={3}
                value={profile.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all resize-vertical text-black"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {isUpdating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </form>
        </section>

        {/* Delete Account */}
        <section className="bg-white rounded-2xl shadow-sm p-8 mt-6">
          <h2 className="text-2xl font-bold text-black mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-6">Delete your account permanently. This action cannot be undone.</p>

          <div className="max-w-md">
            <label htmlFor="deletePassword" className="block text-sm font-medium text-black mb-2">Confirm password to delete account</label>
            <input
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all mb-4 text-black"
            />

            {deleteError && <p className="text-sm text-red-700 mb-2">{deleteError}</p>}

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!deletePassword) return setDeleteError('Please enter your password to confirm');
                  setIsDeleting(true);
                  setDeleteError('');
                  try {
                    const res = await fetch(`${API_BASE}/users/me`, {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ password: deletePassword }),
                    });

                    if (res.ok) {
                      // Clear session data and navigate home
                      logout();
                      router.push('/');
                    } else {
                      const data = await res.json();
                      setDeleteError(data.message || 'Failed to delete account');
                    }
                  } catch (err) {
                    setDeleteError('Network error. Please try again.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>

              <button
                onClick={() => { setDeletePassword(''); setDeleteError(''); }}
                className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-black font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>

        {/* My Registrations Section */}
        <section className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">My Event Registrations</h2>
              <p className="text-gray-600">Events you're attending</p>
            </div>
            <button
              onClick={refreshRegistrations}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium rounded-xl transition-all flex items-center gap-2"
              disabled={isLoading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {registrations.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No registrations yet</h3>
              <p className="text-gray-500 mb-6">Register for events from the dashboard to see them here</p>
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div key={reg.id} className="flex gap-6 p-6 border border-gray-100 rounded-xl hover:shadow-md transition-all bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-black pr-4 line-clamp-1">{reg.event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Confirmed
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{reg.event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {new Date(reg.event.startAt).toLocaleDateString()} {new Date(reg.event.startAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{reg.event.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{reg.event._count?.registrations || 0} attendees</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>by {reg.event.creator?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
