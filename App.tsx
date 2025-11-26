import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocalStorage } from './hooks';
import { HomePage, MarketPage, NewsPage, AnalyzerPage, TraderLabPage, CommunityPage, ProfilePage } from './pages';
import { Loader, TopNavBar, Icon, Footer } from './components';
import type { UserProfile, Page } from './types';
import * as FirestoreService from './services/firestoreService';
import * as AuthService from './services/authService';

import { AnimatedLogin } from './components/AnimatedLogin';

// --- Main App Component ---
export default function App() {
    const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('tradesnap_user_profile', null);
    const [page, setPage] = useState<Page>('Home');

    // Auth State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUpdateProfile = (newProfile: UserProfile) => {
        setUserProfile(newProfile);
        FirestoreService.createOrUpdateUserProfile(newProfile);
    };

    const [targetGroupId, setTargetGroupId] = useState<string | undefined>(undefined);
    const [viewProfileUid, setViewProfileUid] = useState<string | null>(null);

    // Handle Invite Links & Profile Links on Mount
    useEffect(() => {
        const init = async () => {
            const path = window.location.pathname;

            // Check for Invite Link
            if (path.startsWith('/join/')) {
                const inviteCode = path.split('/join/')[1];
                if (inviteCode) {
                    localStorage.setItem('pendingInviteCode', inviteCode);
                    window.history.replaceState({}, '', '/');
                }
            }

            // Check for Profile Link
            if (path.startsWith('/profile/')) {
                const uid = path.split('/profile/')[1];
                if (uid) {
                    setViewProfileUid(uid);
                    setPage('Profile');
                }
            }

            // Check Session
            const session = await AuthService.checkSession();
            if (session) {
                setUserProfile(session);
            }
        };
        init();
    }, []);

    // CRITICAL FIX: Persistent auth state listener to prevent session loss
    useEffect(() => {
        const { onAuthStateChanged } = require('firebase/auth');
        const { auth } = require('./firebase/index');

        const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
            if (user && !userProfile) {
                // User is logged in but state is lost - restore it
                try {
                    const profile = await AuthService.checkSession();
                    if (profile) {
                        setUserProfile(profile);
                    }
                } catch (error) {
                    console.error('Error restoring session:', error);
                }
            } else if (!user && userProfile) {
                // User logged out
                setUserProfile(null);
                setPage('Home');
            }
        });

        return () => unsubscribe();
    }, [userProfile]);

    // Process Pending Invite after Login
    useEffect(() => {
        const processInvite = async () => {
            const pendingCode = localStorage.getItem('pendingInviteCode');
            if (pendingCode && userProfile) {
                try {
                    const groupId = await FirestoreService.joinGroupByInviteCode(pendingCode, { uid: userProfile.uid, email: userProfile.email || 'guest' });
                    if (groupId) {
                        setTargetGroupId(groupId);
                        setPage('Community');
                        localStorage.removeItem('pendingInviteCode');
                    }
                } catch (error) {
                    console.error("Failed to join group from invite:", error);
                }
            }
        };
        processInvite();
    }, [userProfile]);

    const handleLogin = async (email: string, pass: string) => {
        setIsLoading(true); setError('');
        try {
            const profile = await AuthService.loginWithEmailPassword(email, pass);
            // Update lastActive timestamp
            const updatedProfile = { ...profile, lastActive: new Date() };
            await FirestoreService.createOrUpdateUserProfile(updatedProfile);
            setUserProfile(updatedProfile);
            setPage('Home');
        } catch (err: any) { setError(err.message || 'Login failed'); } finally { setIsLoading(false); }
    };

    const handleSignup = async (email: string, pass: string) => {
        setIsLoading(true); setError('');
        try {
            const profile = await AuthService.signUpWithEmailPassword(email, pass);
            // Update lastActive timestamp
            const updatedProfile = { ...profile, lastActive: new Date() };
            await FirestoreService.createOrUpdateUserProfile(updatedProfile);
            setUserProfile(updatedProfile);
            setPage('Home');
        } catch (err: any) { setError(err.message || 'Signup failed'); } finally { setIsLoading(false); }
    };

    const handleResetPassword = async (email: string) => {
        setIsLoading(true); setError('');
        try {
            await AuthService.resetPassword(email);
        } catch (err: any) { setError(err.message || 'Failed to send reset link'); } finally { setIsLoading(false); }
    };

    const handleLogout = async () => {
        await AuthService.handleSignOut();
        setUserProfile(null);
        setPage('Home');
    };

    // Render Login/Signup Screen
    if (!userProfile && !viewProfileUid) {
        return (
            <AnimatedLogin
                onLogin={handleLogin}
                onSignup={handleSignup}
                onResetPassword={handleResetPassword}
                isLoading={isLoading}
                error={error}
                setError={setError}
            />
        );
    }

    // Render Main App
    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-[#0a0e1a] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col`}>
            <TopNavBar page={page} setPage={setPage} />
            <main className="pt-20 px-4 max-w-7xl mx-auto w-full flex-grow">
                <AnimatePresence mode="wait">
                    <motion.div key={page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {page === 'Home' && <HomePage userProfile={userProfile} setPage={setPage} />}
                        {page === 'Market' && <MarketPage />}
                        {page === 'News' && <NewsPage />}
                        {page === 'Analyzer' && <AnalyzerPage />}
                        {page === 'TraderLab' && <TraderLabPage />}
                        {page === 'Community' && <CommunityPage initialGroupId={targetGroupId} userProfile={userProfile} />}
                        {page === 'Profile' && <ProfilePage profile={userProfile} viewUid={viewProfileUid} onProfileUpdate={handleUpdateProfile} onLogout={handleLogout} />}
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
}
