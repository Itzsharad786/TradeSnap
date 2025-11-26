import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Loader } from '../components';

interface AnimatedLoginProps {
    onLogin: (email: string, pass: string) => Promise<void>;
    onSignup: (email: string, pass: string) => Promise<void>;
    onResetPassword: (email: string) => Promise<void>;
    isLoading: boolean;
    error: string;
    setError: (err: string) => void;
}

export const AnimatedLogin: React.FC<AnimatedLoginProps> = ({
    onLogin,
    onSignup,
    onResetPassword,
    isLoading,
    error,
    setError
}) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetSent, setResetSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'forgot') {
            if (!email) return setError('Please enter your email');
            await onResetPassword(email);
            setResetSent(true);
            return;
        }

        if (!email || !password) return setError('Please fill in all fields');

        if (mode === 'signup') {
            if (password !== confirmPassword) return setError('Passwords do not match');
            await onSignup(email, password);
        } else {
            await onLogin(email, password);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
            {/* Static Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10 p-4"
            >
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
                    {/* Header */}
                    <div className="p-8 pb-0 text-center">
                        <img
                            src="/bull-logo.png"
                            alt="Tradesnap Logo"
                            className="mx-auto h-32 w-32 object-contain mb-6 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                        />
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {mode === 'login' ? 'Enter your details to continue' : mode === 'signup' ? 'Start your trading journey today' : 'We will send you a recovery link'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-3 rounded-xl text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                            {resetSent && mode === 'forgot' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-green-500/10 border border-green-500/20 text-green-200 text-sm p-3 rounded-xl text-center"
                                >
                                    Reset link sent! Check your email.
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Icon name="mail" className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-sky-400 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                                />
                            </div>

                            {mode !== 'forgot' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative group">
                                    <Icon name="lock" className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-sky-400 transition-colors" />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                                    />
                                </motion.div>
                            )}

                            {mode === 'signup' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative group">
                                    <Icon name="lock" className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-sky-400 transition-colors" />
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                                    />
                                </motion.div>
                            )}
                        </div>

                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button type="button" onClick={() => { setMode('forgot'); setError(''); }} className="text-xs text-gray-400 hover:text-sky-400 transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-500/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? <Loader size="sm" /> : (mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link')}
                        </button>

                        <div className="text-center pt-2">
                            {mode === 'login' ? (
                                <p className="text-sm text-gray-400">
                                    Don't have an account? <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-sky-400 hover:text-sky-300 font-medium">Sign Up</button>
                                </p>
                            ) : mode === 'signup' ? (
                                <p className="text-sm text-gray-400">
                                    Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-sky-400 hover:text-sky-300 font-medium">Sign In</button>
                                </p>
                            ) : (
                                <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-sm text-gray-400 hover:text-white flex items-center justify-center gap-1 mx-auto">
                                    <Icon name="arrowDown" className="rotate-90 h-3 w-3" /> Back to Login
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};
