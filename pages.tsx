import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from './services/firebase';
import * as FirestoreService from './services/firestoreService';
import { getUserGroupCounts, joinGroupByInviteCodeAndPassword } from './services/firestoreService';
import * as AiService from './services/geminiService';
import { fetchNews } from './services/newsService';

import { Icon, Button, Card, Avatar, Modal, Loader, NewsCard, Tabs, CreateGroupModal, GuestPromptModal, Toast, JoinByInviteModal } from './components';
import { ProfileAvatarPicker } from './components/ProfileAvatarPicker';
import { GroupPage } from './components/GroupPage';
import type { UserProfile, Page, Group, GroupChatMessage, TraderLabTopic, NewsArticleWithImage } from './types';
import TOPICS_DATA from './topics.json';

// --- STORAGE HELPER (Inlined for portability) ---
const uploadGroupImage = async (file: File, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

// --- PAGE WRAPPER ---
const PageWrapper: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
    >
        {children}
    </motion.div>
);

// --- HOME PAGE ---
export const HomePage: React.FC<{ userProfile: UserProfile | null, setPage: (page: Page) => void }> = ({ userProfile, setPage }) => (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0e1a]">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
            <div className="mb-8 relative">
                <div className="absolute -inset-10 bg-sky-500/20 blur-3xl rounded-full" />
                <img src="/bull-logo.png" alt="Tradesnap Bull" className="w-32 h-32 md:w-48 md:h-48 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(14,165,233,0.6)]" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl">
                TRADE<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">SNAP</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-10 font-light leading-relaxed">
                Master the markets with AI-powered simulation. <br />
                <span className="text-sky-400 font-medium">Zero Risk. Maximum Reward.</span>
            </p>
            <div className="flex gap-4">
                <button onClick={() => setPage('Community')} className="px-8 py-4 bg-sky-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-sky-500 transition-all">
                    Join Community
                </button>
                <button onClick={() => setPage('Market')} className="px-8 py-4 bg-gray-800 text-white font-bold text-lg rounded-full hover:bg-gray-700 transition-all">
                    View Market
                </button>
            </div>
        </div>
    </div>
);

// --- MARKET PAGE ---
export const MarketPage: React.FC = () => {
    const [stocks, setStocks] = useState([
        { symbol: 'AAPL', price: 150.25, market: 'NASDAQ' },
        { symbol: 'TSLA', price: 245.60, market: 'NASDAQ' },
        { symbol: 'BTC-USD', price: 42150.00, market: 'CRYPTO' },
        { symbol: 'EUR/USD', price: 1.0850, market: 'FOREX' },
        { symbol: 'NVDA', price: 460.10, market: 'NASDAQ' },
        { symbol: 'ETH-USD', price: 2250.00, market: 'CRYPTO' },
    ]);
    const [selectedStock, setSelectedStock] = useState<any>(null);
    const [simResult, setSimResult] = useState('');
    const [simLoading, setSimLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setStocks(prev => prev.map(s => ({ ...s, price: s.price * (1 + (Math.random() * 0.002 - 0.001)) })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const runAnalysis = async () => {
        if (!selectedStock) return;
        setSimLoading(true);
        const res = await AiService.analyzeStock(selectedStock.symbol);
        setSimResult(res);
        setSimLoading(false);
    };

    return (
        <PageWrapper>
            <div className="mb-8"><h2 className="text-3xl font-bold">Live Market Feed</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stocks.map((stock, i) => (
                    <div key={i} className="bg-white dark:bg-[#111625] border border-gray-200 dark:border-gray-800 p-4 rounded-xl hover:border-sky-500 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div><h3 className="font-bold text-lg">{stock.symbol}</h3><span className="text-xs text-gray-500 uppercase">{stock.market}</span></div>
                            <div className="text-right text-emerald-500"><div className="font-mono font-medium">{stock.price.toFixed(4)}</div></div>
                        </div>
                        <Button onClick={() => setSelectedStock(stock)} variant="secondary" className="w-full text-xs h-9">Analyze</Button>
                    </div>
                ))}
            </div>
            {selectedStock && (
                <Modal onClose={() => setSelectedStock(null)}>
                    <h2 className="text-2xl font-bold mb-4">{selectedStock.symbol} Analysis</h2>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 min-h-[100px]">
                        {simLoading ? <Loader text="AI Analyzing..." /> : (simResult ? <pre className="whitespace-pre-wrap font-mono text-xs">{simResult}</pre> : <div className="text-center text-gray-400 text-sm">Click Analyze.</div>)}
                    </div>
                    <Button className="w-full" onClick={runAnalysis}>Run Analysis</Button>
                </Modal>
            )}
        </PageWrapper>
    );
};

// --- COMMUNITY COMPONENTS ---
const GroupList: React.FC<{ userProfile: UserProfile | null, onSelectGroup: (g: Group) => void }> = ({ userProfile, onSelectGroup }) => {
    const [activeTab, setActiveTab] = useState<'explore' | 'my_groups'>('explore');
    const [publicGroups, setPublicGroups] = useState<Group[]>([]);
    const [ownedGroups, setOwnedGroups] = useState<Group[]>([]);
    const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [search, setSearch] = useState('');
    const [toastMsg, setToastMsg] = useState('');

    // Always fetch owned groups to get counts for Create Modal
    useEffect(() => {
        if (userProfile) {
            const unsubOwned = FirestoreService.getGroupsForOwner(userProfile.uid, (loaded) => {
                setOwnedGroups(loaded);
            });
            return () => unsubOwned();
        }
    }, [userProfile]);

    useEffect(() => {
        if (activeTab === 'explore') {
            setLoading(true);
            const unsubscribe = FirestoreService.getPublicGroups((loaded) => {
                setPublicGroups(loaded);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'my_groups' && userProfile) {
            setLoading(true);
            // Owned groups already fetched by the other effect, but we need joined groups
            const unsubJoined = FirestoreService.getGroupsForUser(userProfile.uid, (loaded) => {
                const filtered = loaded.filter(g => g.ownerUid !== userProfile.uid);
                setJoinedGroups(filtered);
                setLoading(false);
            });
            return () => unsubJoined();
        }
    }, [activeTab, userProfile]);

    const handleCreateGroup = async (data: any) => {
        if (!userProfile) return;
        try {
            await FirestoreService.createGroup({
                ...data,
                ownerUid: userProfile.uid,
                ownerEmail: userProfile.email || 'guest',
                avatarUrl: 'community'
            });
            setShowCreate(false);
            setActiveTab('my_groups');
            setToastMsg('Group created successfully! 🎉');
        } catch (e: any) {
            alert(e.message || 'Failed to create group');
        }
    };

    const handleJoinByCode = async (code: string, password?: string) => {
        if (!userProfile) return;
        try {
            const result = await FirestoreService.joinGroupByInviteCodeAndPassword(code, password || '', { uid: userProfile.uid, email: userProfile.email || 'guest' });

            if (result.success) {
                setToastMsg('Joined group successfully! 🚀');
                setShowJoinModal(false);
                setActiveTab('my_groups');
            } else {
                alert(result.error || 'Failed to join.');
            }
        } catch (e) { alert('Error joining.'); }
    };

    const renderGroupCard = (g: Group, isOwned: boolean = false) => (
        <Card key={g.id} className="hover:border-sky-500 cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg" onClick={() => onSelectGroup(g)}>
            <div className="relative p-4">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar avatar={g.avatarUrl || 'community'} className="h-14 w-14 rounded-xl border-4 border-white dark:border-[#111625] shadow-md bg-white dark:bg-gray-800" />
                    <div className="flex-grow">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg leading-none line-clamp-1">{g.name}</h3>
                            {g.isPrivate && <Icon name="lock" className="h-3 w-3 text-amber-500" />}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            {isOwned ? <span className="text-sky-500 font-bold">Owner</span> : <span>{g.members?.length || 0} Members</span>}
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 px-4 pb-4">{g.description}</p>
        </Card>
    );

    const filteredPublic = publicGroups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.description?.toLowerCase().includes(search.toLowerCase()));

    // Calculate counts for limits
    const publicCount = ownedGroups.filter(g => g.type === 'public' || (!g.type && !g.isPrivate)).length;
    const privateCount = ownedGroups.filter(g => g.type === 'private' || (!g.type && g.isPrivate)).length;

    return (
        <div className="space-y-6">
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div><h2 className="text-3xl font-bold">Community</h2><p className="text-gray-500">Join elite trading groups.</p></div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={() => setShowJoinModal(true)} variant="secondary"><Icon name="plus" /> Join via Code</Button>
                    <Button onClick={() => setShowCreate(true)}><Icon name="plus" /> Create</Button>
                </div>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button className={`px-6 py-3 font-bold text-sm border-b-2 ${activeTab === 'explore' ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('explore')}>Explore</button>
                <button className={`px-6 py-3 font-bold text-sm border-b-2 ${activeTab === 'my_groups' ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('my_groups')}>My Groups</button>
            </div>

            {loading ? <Loader text="Loading..." /> : (
                <>
                    {activeTab === 'explore' && (
                        <>
                            <div className="relative mb-6">
                                <Icon name="search" className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search communities..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-[#111625] border border-gray-200 dark:border-gray-800 focus:border-sky-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {filteredPublic.map(g => renderGroupCard(g, userProfile?.uid === g.ownerUid))}
                            </div>
                        </>
                    )}
                    {activeTab === 'my_groups' && (
                        <div className="space-y-8">
                            {ownedGroups.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Icon name="star" className="h-5 w-5 text-amber-500" />
                                        Groups You Own
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {ownedGroups.map(g => renderGroupCard(g, true))}
                                    </div>
                                </div>
                            )}
                            {joinedGroups.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4">Groups You Joined</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {joinedGroups.map(g => renderGroupCard(g, false))}
                                    </div>
                                </div>
                            )}
                            {ownedGroups.length === 0 && joinedGroups.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <Icon name="community" className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                    <p>You haven't joined any groups yet.</p>
                                    <p className="text-sm mt-2">Create your own or explore public groups!</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
            {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreate={handleCreateGroup} publicCount={publicCount} privateCount={privateCount} />}
            {showJoinModal && <JoinByInviteModal onClose={() => setShowJoinModal(false)} onJoin={handleJoinByCode} />}
        </div>
    );
};

export const CommunityPage: React.FC<{ initialGroupId?: string, userProfile?: UserProfile }> = ({ initialGroupId, userProfile }) => {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    if (selectedGroup) return <PageWrapper><GroupPage group={selectedGroup} userProfile={userProfile || null} onBack={() => setSelectedGroup(null)} /></PageWrapper>;
    return <PageWrapper><GroupList userProfile={userProfile || null} onSelectGroup={setSelectedGroup} /></PageWrapper>;
};

// --- TRADERLAB PAGE ---
const TOPICS: TraderLabTopic[] = TOPICS_DATA as TraderLabTopic[];
export const TraderLabPage: React.FC = () => {
    const [activeTopic, setActiveTopic] = useState<TraderLabTopic | null>(null);
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const handleExplain = async () => {
        if (!activeTopic) return;
        setLoading(true);
        const result = await AiService.explainConcept(`${activeTopic.title} - ${activeTopic.description}`);
        setExplanation(result);
        setLoading(false);
    };
    return (
        <PageWrapper>
            {!activeTopic ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TOPICS.map(topic => (
                        <Card key={topic.id} className="cursor-pointer hover:scale-[1.02] transition-all p-6" onClick={() => setActiveTopic(topic)}>
                            <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{topic.description}</p>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="max-w-2xl mx-auto">
                    <button onClick={() => setActiveTopic(null)} className="mb-4 text-sm text-gray-500">← Back</button>
                    <h2 className="text-3xl font-bold mb-4">{activeTopic.title}</h2>
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl mb-6">{loading ? <Loader text="AI Explaining..." /> : (explanation || activeTopic.description)}</div>
                    <Button onClick={handleExplain} disabled={loading} className="w-full">Explain with AI</Button>
                </div>
            )}
        </PageWrapper>
    );
};

// --- ANALYZER PAGE ---
export const AnalyzerPage: React.FC = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const handleAnalyze = async () => {
        setLoading(true);
        const res = await AiService.analyzeStock(input);
        setResult(res);
        setLoading(false);
    };
    return (
        <PageWrapper>
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">Market Analyzer</h2>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Enter Symbol (e.g. AAPL)" className="w-full p-4 rounded-xl bg-gray-100 dark:bg-gray-800 mb-4" />
                <Button onClick={handleAnalyze} disabled={loading} className="w-full mb-6">Analyze</Button>
                {result && <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl whitespace-pre-wrap font-mono text-sm">{result}</div>}
            </div>
        </PageWrapper>
    );
};

export const ProfilePage: React.FC<{ profile: UserProfile | null, viewUid?: string | null, onProfileUpdate: any, onLogout: () => void }> = ({ profile, viewUid, onProfileUpdate, onLogout }) => {
    const [displayProfile, setDisplayProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
    const [lastGroupCreation, setLastGroupCreation] = useState<Date | null>(null);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

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

    // Check if following
    useEffect(() => {
        if (profile && targetUid && !isOwnProfile) {
            FirestoreService.isFollowing(profile.uid, targetUid).then(setIsFollowingUser);
        }
    }, [profile, targetUid, isOwnProfile]);

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

    const handleFollowToggle = async () => {
        if (!profile || !targetUid) return;
        setFollowLoading(true);
        try {
            if (isFollowingUser) {
                await FirestoreService.unfollowUser(profile.uid, targetUid);
                setIsFollowingUser(false);
            } else {
                await FirestoreService.followUser(profile.uid, targetUid);
                setIsFollowingUser(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setFollowLoading(false);
        }
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
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <h1 className="text-4xl font-black tracking-tight text-white">{displayProfile.name}</h1>
                                {!isOwnProfile && (
                                    <Button
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                        className={isFollowingUser ? "bg-gray-700 hover:bg-gray-600" : ""}
                                    >
                                        {isFollowingUser ? "Unfollow" : "Follow"}
                                    </Button>
                                )}
                            </div>
                            <p className="text-lg text-gray-400 font-medium">@{displayProfile.username || 'user'}</p>

                            <div className="flex items-center justify-center md:justify-start gap-6 py-2">
                                <div className="text-center">
                                    <span className="block font-bold text-white text-lg">{displayProfile.followersCount || 0}</span>
                                    <span className="text-xs text-gray-500 uppercase">Followers</span>
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-white text-lg">{displayProfile.followingCount || 0}</span>
                                    <span className="text-xs text-gray-500 uppercase">Following</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isOwnProfile ? (
                        <div className="space-y-6">
                            {displayProfile.email && (
                                <p className="text-sm text-gray-500">{displayProfile.email}</p>
                            )}
                            {displayProfile.instagramHandle && (
                                <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                                    <svg className="h-4 w-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                    <input
                                        value={editInstagram}
                                        onChange={e => setEditInstagram(e.target.value)}
                                        placeholder="@username"
                                        className="w-full bg-[#0a0e1a] border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                                    />
                                </div>
                            )}

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

export const NewsPage: React.FC = () => {
    const [news, setNews] = useState<NewsArticleWithImage[]>([]);
    useEffect(() => { fetchNews().then(setNews); }, []);
    return (
        <PageWrapper>
            <h2 className="text-3xl font-bold mb-8">News</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {news.map((n, i) => <NewsCard key={i} article={n} onReadMore={(l) => window.open(l, '_blank')} />)}
            </div>
        </PageWrapper>
    );
};