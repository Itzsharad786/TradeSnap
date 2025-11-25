// UPDATED PROFILE PAGE COMPONENT
// Replace the existing ProfilePage export in pages.tsx with this code

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FirestoreService from './services/firestoreService';
import { Icon, Avatar, Loader } from './components';
import { ProfileAvatarPicker } from './components/ProfileAvatarPicker';
import type { UserProfile, Group } from './types';

// PageWrapper component (copy from pages.tsx or define here)
const PageWrapper: React.FC<{ className?: string } & React.PropsWithChildren> = ({ children, className }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className={`pt-24 pb-8 px-4 md:px-8 max-w-7xl mx-auto ${className}`}
    >
        {children}
    </motion.div>
);

export const ProfilePage: React.FC<{ profile: UserProfile | null, viewUid?: string | null, onProfileUpdate: any, onLogout: () => void }> = ({ profile, viewUid, onProfileUpdate, onLogout }) => {
    const [displayProfile, setDisplayProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
    const [lastGroupCreation, setLastGroupCreation] = useState<Date | null>(null);

    // Determine which UID to show
    const targetUid = viewUid || (profile ? profile.uid : null);
    const isOwnProfile = profile && targetUid === profile.uid;

    // Listen for profile changes
    useEffect(() => {
        if (!targetUid) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const unsubscribe = FirestoreService.listenToUserProfile(targetUid, (fetchedProfile) => {
            setDisplayProfile(fetchedProfile);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [targetUid]);

    // Listen for joined groups
    useEffect(() => {
        if (!targetUid) return;
        const unsubscribe = FirestoreService.getGroupsForUser(targetUid, (groups) => {
            setJoinedGroups(groups);
        });
        return () => unsubscribe();
    }, [targetUid]);

    // Get last group creation date
    useEffect(() => {
        if (!targetUid) return;
        FirestoreService.getLastGroupCreationDate(targetUid)
            .then(setLastGroupCreation)
            .catch(console.error);
    }, [targetUid]);

    // Local edit state
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editInstagram, setEditInstagram] = useState('');

    useEffect(() => {
        if (displayProfile) {
            setEditName(displayProfile.name || '');
            setEditBio(displayProfile.bio || "Crypto enthusiast & day trader.");
            setEditInstagram(displayProfile.instagramHandle || '');
        }
    }, [displayProfile]);

    const handleSave = async () => {
        if (!isOwnProfile || !displayProfile) return;
        setSaving(true);
        const updated = { ...displayProfile, name: editName, bio: editBio, instagramHandle: editInstagram };
        await FirestoreService.createOrUpdateUserProfile(updated);
        onProfileUpdate(updated);
        setSaving(false);
    };

    const stats = [
        { label: 'Groups Joined', value: joinedGroups.length.toString(), icon: 'community', color: 'text-emerald-400' },
        { label: 'Last Group Created', value: lastGroupCreation ? new Date(lastGroupCreation).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never', icon: 'calendar', color: 'text-purple-400' },
        { label: 'Last Active', value: displayProfile?.lastActive ? new Date(displayProfile.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never', icon: 'calendar', color: 'text-blue-400' },
    ];

    if (!targetUid) return <PageWrapper><div className="text-center mt-20">Profile not found.</div></PageWrapper>;
    if (loading) return <PageWrapper><Loader text="Loading Profile..." /></PageWrapper>;
    if (!displayProfile) return <PageWrapper><div className="text-center mt-20">User not found.</div></PageWrapper>;

    return (
        <PageWrapper className="max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none" />

                <div className="relative z-10 p-8 md:p-12">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                        <div className="relative">
                            <motion.div
                                animate={{
                                    boxShadow: [
                                        `0 0 20px ${displayProfile.themeColor || '#0ea5e9'}40`,
                                        `0 0 40px ${displayProfile.themeColor || '#0ea5e9'}60`,
                                        `0 0 20px ${displayProfile.themeColor || '#0ea5e9'}40`
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="rounded-full p-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10"
                            >
                                <Avatar avatar={displayProfile.avatar} className="h-40 w-40 rounded-full border-4 border-[#0a0e1a]" />
                            </motion.div>
                            {isOwnProfile && (
                                <button
                                    onClick={() => setShowAvatarPicker(true)}
                                    className="absolute bottom-2 right-2 p-3 bg-sky-500 hover:bg-sky-400 text-white rounded-full shadow-lg transition-all hover:scale-110"
                                >
                                    <Icon name="upload" className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        <div className="text-center md:text-left flex-grow space-y-2">
                            <h1 className="text-4xl font-black tracking-tight text-white">{displayProfile.name}</h1>
                            <p className="text-lg text-gray-400 font-medium">@{displayProfile.username || 'user'}</p>
                            {displayProfile.email && (
                                <p className="text-sm text-gray-500">{displayProfile.email}</p>
                            )}
                            {displayProfile.instagramHandle && (
                                <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                                    <svg className="h-4 w-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                    <a
                                        href={`https://instagram.com/${displayProfile.instagramHandle.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-pink-500 hover:text-pink-400 transition-colors"
                                    >
                                        @{displayProfile.instagramHandle.replace('@', '')}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-4"
                            >
                                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                    <Icon name={stat.icon} className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Account Created Date */}
                    <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Icon name="calendar" className="h-5 w-5 text-gray-400" />
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Account Created</div>
                                <div className="text-sm text-white font-medium">
                                    {displayProfile.createdAt ? new Date(displayProfile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settings Form */}
                    {isOwnProfile ? (
                        <div className="space-y-6 bg-black/20 rounded-2xl p-8 border border-white/5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Display Name</label>
                                <input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full bg-[#0a0e1a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email (Read-only)</label>
                                <input
                                    value={displayProfile.email || ''}
                                    disabled
                                    className="w-full bg-[#0a0e1a]/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Instagram Username</label>
                                <div className="relative">
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                    <input
                                        value={editInstagram}
                                        onChange={e => setEditInstagram(e.target.value)}
                                        placeholder="@username"
                                        className="w-full bg-[#0a0e1a] border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</label>
                                <textarea
                                    value={editBio}
                                    onChange={e => setEditBio(e.target.value)}
                                    className="w-full bg-[#0a0e1a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all min-h-[120px] resize-none"
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-grow bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onLogout}
                                    className="px-8 py-4 rounded-xl border border-red-500/30 text-red-500 font-bold hover:border-red-500 transition-all"
                                >
                                    Logout
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 bg-black/20 rounded-2xl p-8 border border-white/5">
                            <h3 className="text-xl font-bold text-white">About</h3>
                            <p className="text-gray-400 leading-relaxed">{displayProfile.bio || "No bio available."}</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Avatar Picker Modal */}
            {showAvatarPicker && displayProfile && (
                <ProfileAvatarPicker
                    userProfile={displayProfile}
                    onAvatarChange={async (avatarUrl) => {
                        const updated = { ...displayProfile, avatar: avatarUrl };
                        setDisplayProfile(updated);
                        onProfileUpdate(updated);
                        await FirestoreService.createOrUpdateUserProfile(updated);
                    }}
                    onClose={() => setShowAvatarPicker(false)}
                />
            )}
        </PageWrapper>
    );
};
