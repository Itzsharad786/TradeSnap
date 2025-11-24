
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile, Group, NewsArticleWithImage, Page } from './types';
import { PROFILE_AVATARS } from './types';
import BullLogo from '@/components/bull-logo.png';

export const Icon = ({ name, className }: { name: string, className?: string }) => {
    const icons: { [key: string]: React.ReactElement } = {
        home: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
        market: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
        news: <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h2m-4 3h2m-4 3h2" />,
        analyzer: <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
        lab: <><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 003.86.517l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l.477-2.387a2 2 0 00.547-1.806z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" /></>,
        community: <><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5.423c1.522 0 2.686-1.564 2.14-2.986l-1.428-3.929a2 2 0 00-3.714 0l-1.428 3.929A2.996 2.996 0 0117 20z" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 20h5.423c1.522 0 2.686-1.564 2.14-2.986l-1.428-3.929a2 2 0 00-3.714 0l-1.428 3.929A2.996 2.996 0 017 20z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 20v-5m0 0l-2-2m2 2l2-2" /><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 8.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></>,
        profile: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
        spark: <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
        send: <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
        close: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
        plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
        upload: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
        globe: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />,
        menu: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />,
        trend: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />,
        search: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />,
        chart: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
        badge: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
        lock: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />,
        copy: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />,
        arrowDown: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />,
        arrowRight: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />,
        arrowUp: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />,
        logout: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />,
        "trending-up": <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />,
        mail: <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />,
        sun: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />,
        moon: <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />,
        calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    };

    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className={className || "h-6 w-6"}>
            {icons[name]}
        </svg>
    );
};

export const TopNavBar = ({ page, setPage }: { page: Page, setPage: (p: Page) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems: { name: Page; icon: string; label: string }[] = [
        { name: 'Home', icon: 'home', label: 'Home' },
        { name: 'Market', icon: 'market', label: 'Market' },
        { name: 'News', icon: 'news', label: 'News' },
        { name: 'Analyzer', icon: 'analyzer', label: 'Analyzer' },
        { name: 'TraderLab', icon: 'lab', label: 'TraderLab' },
        { name: 'Community', icon: 'community', label: 'Community' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }} animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg border-b border-white/5' : 'shadow-sm border-b border-transparent'}`}
            style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                background: scrolled ? 'rgba(10, 15, 25, 0.85)' : 'rgba(10, 15, 25, 0.55)'
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setPage('Home')}>
                        <img
                            src={BullLogo}
                            className="w-[58px] h-auto object-contain transition-all duration-300 drop-shadow-[0_0_10px_rgba(14,165,233,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                            alt="Tradesnap logo"
                        />
                        <span className="text-[22px] font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Tradesnap</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navItems.map(item => (
                            <button
                                key={item.name}
                                onClick={() => setPage(item.name)}
                                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${page === item.name ? 'text-sky-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Icon name={item.icon} className={`h-4 w-4 transition-all duration-300 ${page === item.name ? 'drop-shadow-[0_0_5px_rgba(14,165,233,0.5)]' : 'group-hover:text-sky-400 group-hover:drop-shadow-[0_0_5px_rgba(14,165,233,0.5)]'}`} />
                                {item.label}
                                {page === item.name && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] shadow-[0_0_10px_rgba(14,165,233,0.8)] rounded-full bg-sky-500 shadow-sky-500/50"
                                    />
                                )}
                            </button>
                        ))}
                        <div className="h-6 w-px bg-white/10 mx-3" />

                        <button onClick={() => setPage('Profile')} className="ml-2 p-1 hover:bg-white/5 rounded-full transition-colors">
                            <Icon name="profile" className="h-6 w-6 text-gray-400 hover:text-sky-400 transition-colors" />
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-4">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400">
                            <Icon name={isOpen ? "close" : "menu"} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="lg:hidden bg-[#0a0e1a]/95 border-t border-white/5 overflow-hidden shadow-xl backdrop-blur-xl"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navItems.map(item => (
                                <button
                                    key={item.name}
                                    onClick={() => { setPage(item.name); setIsOpen(false); }}
                                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-md text-base font-medium ${page === item.name ? 'bg-white/5 text-sky-400' : 'text-gray-400'}`}
                                >
                                    <Icon name={item.icon} />
                                    {item.label}
                                </button>
                            ))}
                            <button
                                onClick={() => { setPage('Profile'); setIsOpen(false); }}
                                className="flex items-center gap-3 w-full px-3 py-3 rounded-md text-base font-medium text-gray-400"
                            >
                                <Icon name="profile" />
                                Profile
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export const Tabs = ({ tabs, active, onChange }: { tabs: { id: string; label: string }[], active: string, onChange: (id: any) => void }) => (
    <div className="flex p-1 space-x-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl mb-6">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all duration-200 ${active === tab.id
                    ? 'bg-white dark:bg-gray-800 text-sky-600 dark:text-cyan-400 shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
            >
                {tab.label}
            </button>
        ))}
    </div>
);

export const Card: React.FC<React.PropsWithChildren<{ className?: string; onClick?: () => void }>> = ({ children, className, onClick }) => (
    <motion.div
        onClick={onClick}
        className={`bg-white dark:bg-[#111625] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 ${className}`}
    >
        {children}
    </motion.div>
);

export const Button: React.FC<React.PropsWithChildren<{ onClick?: any; className?: string; disabled?: boolean; variant?: 'primary' | 'secondary' | 'outline' | 'danger'; style?: React.CSSProperties }>> = ({ children, onClick, className, disabled, variant = 'primary', style }) => {
    const variants = {
        primary: 'bg-sky-500 text-white shadow-lg hover:bg-sky-400 shadow-sky-500/20',
        secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700',
        outline: 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
            style={style}
        >
            {children}
        </motion.button>
    );
};

export const Loader = ({ text, size = 'md' }: { text?: string, size?: 'sm' | 'md' | 'lg' }) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-10 h-10 border-3'
    };
    return (
        <div className={`flex flex-col items-center justify-center ${size === 'sm' ? 'py-0' : 'py-12'}`}>
            <div className={`${sizes[size]} border-sky-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin ${text ? 'mb-4' : ''}`} />
            {text && <p className="text-sm text-gray-500 font-medium">{text}</p>}
        </div>
    );
};

export const NewsCard: React.FC<{ article: NewsArticleWithImage, onReadMore: (link: string, title: string) => void }> = ({ article, onReadMore }) => {
    const [imgSrc, setImgSrc] = useState(article.image);

    const handleImgError = () => {
        setImgSrc("https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&w=600&q=80");
    };

    useEffect(() => {
        if (!article.image) handleImgError();
        else setImgSrc(article.image);
    }, [article.image]);

    return (
        <div className="group cursor-pointer flex flex-col h-full" onClick={() => onReadMore(article.link, article.title)}>
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3 relative">
                <img
                    src={imgSrc}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={handleImgError}
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                    {article.source.toUpperCase()}
                </div>
            </div>
            <h3 className="font-bold text-lg leading-snug text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2">{article.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-auto line-clamp-2">{article.description}</p>
            <div className="mt-3 flex items-center text-xs text-gray-400 font-medium">
                {new Date(article.publishedAt).toLocaleDateString()}
            </div>
        </div>
    );
};

export const Avatar = ({ avatar, className = "h-10 w-10" }: { avatar: string, className?: string }) => {
    const [imgSrc, setImgSrc] = useState<string>('');

    useEffect(() => {
        const isBase64 = avatar?.startsWith('data:');
        const src = isBase64 ? avatar : (PROFILE_AVATARS[avatar] || avatar);
        setImgSrc(src);
    }, [avatar]);

    const handleError = () => {
        if (imgSrc !== '/avatars/fallback-bull-logo.svg') {
            setImgSrc('/avatars/fallback-bull-logo.svg');
        }
    };

    if (!imgSrc) {
        return <div className={`bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center ${className}`}><Icon name="profile" className="opacity-50" /></div>
    }

    return (
        <img
            src={imgSrc}
            alt="Avatar"
            className={`rounded-full object-cover bg-gray-100 dark:bg-gray-800 ${className}`}
            onError={handleError}
        />
    );
};

export const Modal: React.FC<{ onClose: () => void } & React.PropsWithChildren> = ({ children, onClose }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#111625] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
        >
            <div className="p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><Icon name="close" /></button>
                {children}
            </div>
        </motion.div>
    </div>
);

export const GuestPromptModal: React.FC<{ onSignUp: () => void; onClose: () => void }> = ({ onSignUp, onClose }) => (
    <Modal onClose={onClose}>
        <div className="text-center">
            <div className="h-12 w-12 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="profile" />
            </div>
            <h3 className="text-xl font-bold mb-2">Account Required</h3>
            <p className="text-gray-500 mb-6">Join the community to save progress.</p>
            <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={onSignUp}>Sign In</Button>
            </div>
        </div>
    </Modal>
);

export const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
    useEffect(() => { setTimeout(onClose, 3000); }, []);
    return <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">{message}</div>
}

export const CreateGroupModal: React.FC<{ onClose: () => void, onCreate: (groupData: any) => void }> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [topic, setTopic] = useState('General');
    const [type, setType] = useState<'Public' | 'Private'>('Public');
    const [password, setPassword] = useState('');

    const handleCreate = () => {
        if (!name) return;
        if (type === 'Private' && !password) {
            alert("Password required for private groups");
            return;
        }
        onCreate({ name, topic, type, isPrivate: type === 'Private', password });
    };

    return (
        <Modal onClose={onClose}>
            <h2 className="text-xl font-bold mb-6">Create New Group</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">NAME</label>
                    <input className="w-full bg-gray-100 dark:bg-gray-800 p-3 rounded-lg outline-none" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bitcoin Bulls" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">TOPIC</label>
                    <select className="w-full bg-gray-100 dark:bg-gray-800 p-3 rounded-lg outline-none" value={topic} onChange={e => setTopic(e.target.value)}>
                        <option>General</option>
                        <option>Market Structure</option>
                        <option>Liquidity</option>
                        <option>Psychology</option>
                        <option>Crypto</option>
                        <option>Forex</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">TYPE</label>
                    <div className="flex gap-4">
                        {['Public', 'Private'].map(t => (
                            <button key={t} onClick={() => setType(t as any)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${type === t ? 'bg-sky-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                {type === 'Private' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">PASSWORD</label>
                        <input type="password" className="w-full bg-gray-100 dark:bg-gray-800 p-3 rounded-lg outline-none border border-sky-500/50" placeholder="Set Group Password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                )}
                <Button className="w-full mt-4" onClick={handleCreate}>Create Group</Button>
            </div>
        </Modal>
    );
};

export const Footer = () => (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0e1a] pt-16 pb-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div>
                    <h4 className="font-bold text-lg mb-4">Tradesnap</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered trading simulation for the modern era.</p>
                </div>
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Platform</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-sky-500 transition-colors">Markets</a></li>
                        <li><a href="#" className="hover:text-sky-500 transition-colors">Analyzer</a></li>
                        <li><a href="#" className="hover:text-sky-500 transition-colors">Community</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Company</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-sky-500 transition-colors">About</a></li>
                        <li><a href="#" className="hover:text-sky-500 transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-sky-500 transition-colors">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-sky-500 transition-colors">Privacy</a></li>
                        <li><a href="#" className="hover:text-sky-500 transition-colors">Terms</a></li>
                    </ul>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500">© 2024 Tradesnap. Not financial advice.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <Icon name="globe" className="h-5 w-5 text-gray-400 hover:text-white transition-colors cursor-pointer" />
                </div>
            </div>
        </div>
    </footer>
);
