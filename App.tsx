import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme, useLocalStorage } from './hooks';
import { HomePage, MarketPage, NewsPage, AnalyzerPage, TraderLabPage, CommunityPage, ProfilePage } from './pages';
import { Loader, TopNavBar, Icon, Footer } from './components';
import type { UserProfile, Page } from './types';
import * as FirestoreService from './services/firestoreService';
import * as AuthService from './services/authService';
import BullLogo from '@/components/bull-logo.png';

// --- Main App Component ---
export default function App() {
    const { theme, toggleTheme } = useTheme();
    const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('tradesnap_user_profile', null);
    const [page, setPage] = useState<Page>('Home');

    // Auth State
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'magic'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [magicLinkSent, setMagicLinkSent] = useState(false);

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

    // Handle Invite Links & Magic Link Login on Mount
    useEffect(() => {
        const init = async () => {
            // Check for Magic Link Login
            if (window.location.href.includes('apiKey')) {
                try {
                    const profile = await AuthService.completeMagicLinkLogin();
                    if (profile) {
                        setUserProfile(profile);
                        setPage('Home');
                        return;
                    }
                } catch (e) {
                    console.error("Magic link login failed", e);
                }
            }

            // Check for Invite Link
            const path = window.location.pathname;
            if (path.startsWith('/join/')) {
                const inviteCode = path.split('/join/')[1];
                if (inviteCode) {
                    localStorage.setItem('pendingInviteCode', inviteCode);
                    window.history.replaceState({}, '', '/');
                }
            }

            // Check Session
            const session = await AuthService.checkSession();
            if (session) {
                setUserProfile(session);
                if (session.theme) handleSetTheme(session.theme);
            }
        };
        init();
    }, []);

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

    const handleLogin = async () => {
        if (!email || !password) { setError('Please fill in all fields'); return; }
        setIsLoading(true); setError('');
        try {
            const profile = await AuthService.loginWithEmailPassword(email, password);
            setUserProfile(profile);
            setPage('Home');
        } catch (err: any) { setError(err.message || 'Login failed'); } finally { setIsLoading(false); }
    };

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) { setError('Please fill in all fields'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        setIsLoading(true); setError('');
        try {
            const profile = await AuthService.signUpWithEmailPassword(email, password);
            setUserProfile(profile);
            setPage('Home');
        } catch (err: any) { setError(err.message || 'Signup failed'); } finally { setIsLoading(false); }
    };

    const handleGuestLogin = async () => {
        setIsLoading(true); setError('');
        try {
            const profile = await AuthService.loginAsGuest();
            setUserProfile(profile);
            setPage('Home');
        } catch (err: any) { setError(err.message || 'Guest login failed'); } finally { setIsLoading(false); }
    };

    const handleMagicLink = async () => {
        if (!email) { setError('Please enter your email'); return; }
        setIsLoading(true); setError('');
        try {
            await AuthService.sendMagicLink(email);
            setMagicLinkSent(true);
            setError('');
        } catch (err: any) { setError(err.message || 'Failed to send link'); } finally { setIsLoading(false); }
    };

    const handleLogout = async () => {
        await AuthService.handleSignOut();
        setUserProfile(null);
        setEmail('');
        setPassword('');
        setAuthMode('login');
        setPage('Home');
    };

    // Render Login/Signup Screen
    if (!userProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-4 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8">
                        <div className="text-center mb-8">
                            <img src={BullLogo} alt="Tradesnap Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Tradesnap</h1>
                            <p className="text-gray-400 mt-2">AI-Powered Trading Simulator</p>
                        </div>

                        <div className="space-y-4">
                            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center">{error}</div>}
                            {magicLinkSent && <div className="bg-green-500/10 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm text-center">Magic link sent! Check your email.</div>}

                            {!magicLinkSent && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2 ml-1">Email Address</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="w-full p-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-white placeholder-gray-600" />
                                    </div>

                                    {authMode !== 'magic' && (
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2 ml-1">Password</label>
                                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-white placeholder-gray-600" />
                                        </div>
                                    )}

                                    {authMode === 'signup' && (
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2 ml-1">Confirm Password</label>
                                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full p-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-white placeholder-gray-600" />
                                        </div>
                                    )}

                                    <button
                                        onClick={authMode === 'login' ? handleLogin : authMode === 'signup' ? handleSignup : handleMagicLink}
                                        disabled={isLoading}
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-sky-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                                    >
                                        {isLoading ? <Loader size="sm" /> : (authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Send Magic Link')}
                                    </button>
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <button onClick={() => { setAuthMode('login'); setError(''); }} className={`py-2 rounded-lg text-sm ${authMode === 'login' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>Password Login</button>
                                <button onClick={() => { setAuthMode('magic'); setError(''); }} className={`py-2 rounded-lg text-sm ${authMode === 'magic' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>Magic Link</button>
                            </div>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-[#161e2e] text-gray-500">Or</span></div>
                            </div>

                            <button onClick={handleGuestLogin} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium transition-all hover:text-white flex items-center justify-center gap-2">
                                <Icon name="user" className="h-4 w-4" /> Continue as Guest
                            </button>

                            <div className="text-center mt-4">
                                <button onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')} className="text-sm text-sky-400 hover:underline">
                                    {authMode === 'signup' ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Render Main App
    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-[#0a0e1a] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col`}>
            <TopNavBar page={page} setPage={setPage} theme={userProfile?.theme || 'dark'} setTheme={handleSetTheme} themeColor={userProfile?.themeColor} />
            <main className="pt-20 px-4 max-w-7xl mx-auto w-full flex-grow">
                <AnimatePresence mode="wait">
                    <motion.div key={page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {page === 'Home' && <HomePage userProfile={userProfile} setPage={setPage} />}
                        {page === 'Market' && <MarketPage />}
                        {page === 'News' && <NewsPage />}
                        {page === 'Analyzer' && <AnalyzerPage />}
                        {page === 'TraderLab' && <TraderLabPage />}
                        {page === 'Community' && <CommunityPage initialGroupId={targetGroupId} userProfile={userProfile} />}
                        {page === 'Profile' && <ProfilePage profile={userProfile} onProfileUpdate={handleUpdateProfile} onLogout={handleLogout} />}
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
}
