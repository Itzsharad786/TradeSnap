import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme, useLocalStorage } from './hooks';
import { HomePage, MarketPage, NewsPage, AnalyzerPage, TraderLabPage, CommunityPage, ProfilePage } from './pages';
import { Loader, TopNavBar, Button, Card, Icon } from './components';
import type { UserProfile, Page } from './types';
import * as FirestoreService from './services/firestoreService';
import * as AuthService from './services/authService';

// --- Main App Component ---
export default function App() {
    const { theme, toggleTheme } = useTheme();
    const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('tradesnap_user_profile', null);
    const [page, setPage] = useState<Page>('Home');

    // Auth State
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle Theme Change
    const handleSetTheme = (newTheme: any) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'ocean', 'forest', 'sunset');
        root.classList.add(newTheme);
        if (userProfile) {
            const updated = { ...userProfile, theme: newTheme };
            setUserProfile(updated);
            FirestoreService.createOrUpdateUserProfile(updated);
        }
    };

    const handleUpdateProfile = (newProfile: UserProfile) => {
        setUserProfile(newProfile);
        FirestoreService.createOrUpdateUserProfile(newProfile);
    };

    useEffect(() => {
        if (userProfile?.theme) handleSetTheme(userProfile.theme);
    }, [userProfile?.theme]);

    const [targetGroupId, setTargetGroupId] = useState<string | undefined>(undefined);

    // Handle Invite Links on Mount
    useEffect(() => {
        const path = window.location.pathname;
        if (path.startsWith('/join/')) {
            const inviteCode = path.split('/join/')[1];
            if (inviteCode) {
                localStorage.setItem('pendingInviteCode', inviteCode);
                // Clean URL
                window.history.replaceState({}, '', '/');
            }
        }
    }, []);

    // Process Pending Invite after Login
    useEffect(() => {
        const processInvite = async () => {
            const pendingCode = localStorage.getItem('pendingInviteCode');
            if (pendingCode && userProfile) {
                try {
                    const groupId = await FirestoreService.joinGroupByInviteCode(pendingCode, userProfile.uid);
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

    // Check session on mount
    useEffect(() => {
        const loadSession = async () => {
            const session = await AuthService.checkSession();
            if (session) {
                setUserProfile(session);
                if (session.theme) handleSetTheme(session.theme);
            }
        };
        loadSession();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const profile = await AuthService.loginWithEmailPassword(email, password);
            setUserProfile(profile);
            setPage('Home');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const profile = await AuthService.signUpWithEmailPassword(email, password);
            setUserProfile(profile);
            setPage('Home');
        } catch (err: any) {
            console.error('Signup error in App.tsx:', err);
            const errorMessage = err.message || 'Signup failed';
            console.log('Setting error message:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await AuthService.handleSignOut();
        setUserProfile(null);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAuthMode('login');
        setPage('Home');
    };

    // Render Login/Signup Screen
    if (!userProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-4 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-sky-500/30">
                                <Icon name="trending-up" className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Tradesnap</h1>
                            <p className="text-gray-400 mt-2">AI-Powered Trading Simulator</p>
                        </div>

                        <div className="space-y-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div>
                                <label className="block text-sm text-gray-400 mb-2 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full p-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-white placeholder-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2 ml-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full p-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-white placeholder-gray-600"
                                />
                            </div>

                            {authMode === 'signup' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <label className="block text-sm text-gray-400 mb-2 ml-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full p-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-white placeholder-gray-600 mb-4"
                                    />
                                </motion.div>
                            )}

                            <button
                                onClick={authMode === 'login' ? handleLogin : handleSignup}
                                disabled={isLoading}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-sky-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                            >
                                {isLoading ? <Loader size="sm" /> : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-[#161e2e] text-gray-500">Or</span></div>
                            </div>

                            <button
                                onClick={() => {
                                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                    setError('');
                                    setPassword('');
                                    setConfirmPassword('');
                                }}
                                className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium transition-all hover:text-white"
                            >
                                {authMode === 'login' ? 'Create an Account' : 'Back to Login'}
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-600 mt-8">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </motion.div>
            </div>
        );
    }

    // Render Main App
    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-[#0a0e1a] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300`}>
            <TopNavBar
                page={page}
                setPage={setPage}
                theme={userProfile?.theme || 'dark'}
                setTheme={handleSetTheme}
                themeColor={userProfile?.themeColor}
            />

            <main className="pt-20 pb-24 md:pb-8 px-4 max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={page}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {page === 'Home' && <HomePage userProfile={userProfile} setPage={setPage} />}
                        {page === 'Market' && <MarketPage />}
                        {page === 'News' && <NewsPage />}
                        {page === 'Analyzer' && <AnalyzerPage />}
                        {page === 'TraderLab' && <TraderLabPage />}
                        {page === 'Community' && <CommunityPage initialGroupId={targetGroupId} />}
                        {page === 'Profile' && (
                            <ProfilePage
                                profile={userProfile}
                                onProfileUpdate={handleUpdateProfile}
                                onLogout={handleLogout}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            <div className="fixed bottom-0 left-0 w-full text-center py-2 bg-white/80 dark:bg-black/80 backdrop-blur-md text-[10px] text-gray-500 z-40 border-t border-gray-200 dark:border-gray-800">
                Not financial advice. Use at your own risk.
            </div>
        </div>
    );
}
