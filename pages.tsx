import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { useMarketData } from './hooks';
import * as AiService from './services/geminiService';
import { fetchNews } from './services/newsService';
import { Icon, Card, Button, Loader, Modal, NewsCard, Avatar, Tabs, CreateGroupModal, ThemePicker } from './components';
import type { UserProfile, Page, TraderLabTopic, NewsArticleWithImage, Group, GroupChatMessage } from './types';
import { PROFILE_AVATARS } from './types';
import * as FirestoreService from './services/firestoreService';
import TOPICS_DATA from './topics.json';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const PageWrapper: React.FC<{ className?: string } & React.PropsWithChildren> = ({ children, className }) => (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className={`pt-24 pb-8 px-4 md:px-8 max-w-7xl mx-auto ${className}`}>
        {children}
    </motion.div>
);

// --- HOME PAGE ---
export const HomePage: React.FC<{ userProfile: UserProfile, setPage: (page: Page) => void }> = ({ userProfile, setPage }) => {
    const features = [
        { page: 'Market', title: 'Live Forex & Crypto', desc: 'Simulated real-time market data.', icon: 'market', color: 'text-emerald-400' },
        { page: 'Analyzer', title: 'AI Chart Vision', desc: 'Instant technical analysis.', icon: 'analyzer', color: 'text-blue-400' },
        { page: 'TraderLab', title: 'Knowledge Base', desc: 'Master trading concepts.', icon: 'lab', color: 'text-purple-400' },
        { page: 'Community', title: 'Global Network', desc: 'Join elite trader groups.', icon: 'community', color: 'text-pink-400' },
    ];

    return (
        <motion.div initial="initial" animate="animate" exit="exit" className="min-h-screen">
            <section className="relative h-[85vh] flex flex-col items-center justify-center text-center overflow-hidden px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-transparent dark:from-[#050810] dark:via-[#0a0e1a] dark:to-transparent -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-sky-500/10 dark:bg-cyan-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: Math.random() * 1000 - 500, y: Math.random() * 500 - 250 }}
                            animate={{ opacity: [0, 0.5, 0], x: Math.random() * 1000 - 500, y: Math.random() * 500 - 250 }}
                            transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/2 left-1/2 w-1 h-1 bg-sky-500 rounded-full"
                        />
                    ))}
                </div>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="mb-6 relative z-10">
                    <span className="px-4 py-1.5 rounded-full border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-xs font-bold tracking-wider uppercase mb-6 inline-block backdrop-blur-md">Tradesnap AI 2.0</span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">Precision Trading <br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-indigo-600 dark:from-cyan-400 dark:to-blue-500">Starts Here.</span></h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">AI-powered analysis, real-time simulation, and a global community of elite traders.</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage('Market')}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                    >
                        Start Trading →
                    </motion.button>
                </motion.div>
            </section>
            <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div key={i} onClick={() => setPage(f.page as Page)} className="group cursor-pointer relative p-8 rounded-2xl bg-white/50 dark:bg-[#111625]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:border-sky-500 dark:hover:border-cyan-500 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/10 overflow-hidden h-full">
                            <div className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-800 w-fit mb-4 ${f.color} bg-opacity-10 dark:bg-opacity-20`}><Icon name={f.icon} className="h-6 w-6" /></div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </motion.div>
    );
};

// --- MARKET PAGE ---
export const MarketPage: React.FC = () => {
    const [stocks, setStocks] = useState([{ symbol: "EUR/USD", price: 1.0850, change: 0.0012, market: "Forex" }, { symbol: "BTC/USD", price: 64000, change: 1200, market: "Crypto" }]);
    const [selectedStock, setSelectedStock] = useState<any | null>(null);
    const [simResult, setSimResult] = useState('');
    const [simLoading, setSimLoading] = useState(false);

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
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [search, setSearch] = useState('');

    // Fetch public groups for explore tab
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

    // Fetch owned and joined groups for my_groups tab
    useEffect(() => {
        if (activeTab === 'my_groups' && userProfile) {
            setLoading(true);
            const unsubOwned = FirestoreService.getGroupsForOwner(userProfile.uid, (loaded) => {
                setOwnedGroups(loaded);
            });
            const unsubJoined = FirestoreService.getGroupsForUser(userProfile.uid, (loaded) => {
                // Filter out owned groups from joined groups
                const filtered = loaded.filter(g => g.ownerUid !== userProfile.uid);
                setJoinedGroups(filtered);
                setLoading(false);
            });
            return () => { unsubOwned(); unsubJoined(); };
        }
    }, [activeTab, userProfile]);

    const handleCreateGroup = async (data: any) => {
        if (!userProfile) return;
        try {
            await FirestoreService.createGroup({
                ...data,
                ownerUid: userProfile.uid,
                ownerEmail: userProfile.email || 'guest',
                members: [{ uid: userProfile.uid, email: userProfile.email || 'guest', joinedAt: new Date().toISOString() }]
            });
            setShowCreate(false); setActiveTab('my_groups');
        } catch (e) { alert('Failed to create group'); }
    };

    const handleJoinByCode = async () => {
        if (!userProfile || !joinCode) return;
        setJoining(true);
        try {
            const groupId = await FirestoreService.joinGroupByInviteCode(joinCode, { uid: userProfile.uid, email: userProfile.email || 'guest' });
            if (groupId) { alert('Joined!'); setJoinCode(''); } else { alert('Invalid code.'); }
        } catch (e) { alert('Error joining.'); } finally { setJoining(false); }
    };

    const renderGroupCard = (g: Group, isOwned: boolean = false) => (
        <Card key={g.id} className="hover:border-sky-500 cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg" onClick={() => onSelectGroup(g)}>
            <div className="relative">
                <div className="h-16 bg-gradient-to-r from-sky-500/10 to-blue-600/10 rounded-t-xl -mx-6 -mt-6 mb-4" />
                <div className="flex items-center gap-3 mb-4 -mt-8 px-2">
                    <Avatar avatar={g.avatarUrl || 'community'} className="h-14 w-14 rounded-xl border-4 border-white dark:border-[#111625] shadow-md" />
                    <div className="flex-grow pt-6">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg leading-none">{g.name}</h3>
                            {g.isPrivate && <Icon name="lock" className="h-3 w-3 text-amber-500" />}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            {isOwned ? <span className="text-sky-500 font-bold">Owner</span> : <span>{g.members?.length || 0} Members</span>}
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{g.description}</p>
        </Card>
    );

    const filteredPublic = publicGroups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.description?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div><h2 className="text-3xl font-bold">Community</h2><p className="text-gray-500">Join elite trading groups.</p></div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Invite Code" className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-full md:w-32" />
                        <button onClick={handleJoinByCode} disabled={!joinCode || joining} className="absolute right-1 top-1 bottom-1 px-2 bg-sky-500 text-white rounded text-xs">Join</button>
                    </div>
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
            {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreate={handleCreateGroup} />}
        </div>
    );
};

const GroupPageInternal: React.FC<{ group: Group, userProfile: UserProfile | null, onBack: () => void }> = ({ group, userProfile, onBack }) => {
    const [activeTab, setActiveTab] = useState('chat');
    const [messages, setMessages] = useState<GroupChatMessage[]>([]);
    const [msgText, setMsgText] = useState('');
    const [uploading, setUploading] = useState(false);
    const isMember = group.members?.some(m => m.uid === userProfile?.uid);
    const isOwner = userProfile?.uid === group.ownerUid;

    useEffect(() => {
        const unsubscribe = FirestoreService.getGroupMessages(group.id, setMessages);
        return () => unsubscribe();
    }, [group.id]);

    const handleSendMessage = async () => {
        if (!msgText.trim() || !userProfile) return;
        await FirestoreService.sendMessageToGroup(group.id, { text: msgText, authorName: userProfile.name, authorAvatar: userProfile.avatar, authorId: userProfile.uid, type: 'text', reactions: {} });
        setMsgText('');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userProfile) return;
        setUploading(true);
        try {
            const url = await uploadGroupImage(file, `groups/${group.id}/${Date.now()}_${file.name}`);
            await FirestoreService.sendMessageToGroup(group.id, { text: 'Shared an image', authorName: userProfile.name, authorAvatar: userProfile.avatar, authorId: userProfile.uid, type: 'image', mediaUrl: url, reactions: {} });
        } catch (e) { alert('Upload failed'); } finally { setUploading(false); }
    };

    const handleJoin = async () => {
        if (!userProfile) return;
        if (group.isPrivate && !isOwner) {
            const pwd = prompt("Enter Group Password:");
            if (pwd !== group.password) { alert("Incorrect password"); return; }
        }
        await FirestoreService.joinGroup(group.id, { uid: userProfile.uid, email: userProfile.email || 'guest' });
    };

    const handleDelete = async () => {
        if (confirm("Delete group?")) { await FirestoreService.deleteGroup(group.id); onBack(); }
    };

    return (
        <div className="h-[85vh] flex flex-col">
            <div className="flex justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <button onClick={onBack}><Icon name="arrowLeft" /></button>
                    <h2 className="font-bold text-xl">{group.name}</h2>
                </div>
                <div className="flex gap-2">
                    {!isMember && <Button onClick={handleJoin}>Join</Button>}
                    {isOwner && <Button variant="danger" onClick={handleDelete}>Delete</Button>}
                </div>
            </div>
            <Tabs active={activeTab} onChange={setActiveTab} tabs={[{ id: 'chat', label: 'Chat' }, { id: 'members', label: 'Members' }, { id: 'info', label: 'Info' }]} />
            <div className="flex-grow overflow-hidden relative mt-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                {activeTab === 'chat' && (
                    <div className="h-full flex flex-col">
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex gap-3 ${msg.authorId === userProfile?.uid ? 'flex-row-reverse' : ''}`}>
                                    <Avatar avatar={msg.authorAvatar} className="h-8 w-8" />
                                    <div className={`p-3 rounded-2xl ${msg.authorId === userProfile?.uid ? 'bg-sky-500 text-white' : 'bg-white dark:bg-gray-800'}`}>
                                        {msg.type === 'text' ? msg.text : <img src={msg.mediaUrl} className="max-w-[200px] rounded" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {isMember && (
                            <div className="p-4 flex gap-2">
                                <label className="p-2 cursor-pointer"><Icon name="image" /><input type="file" hidden onChange={handleImageUpload} disabled={uploading} /></label>
                                <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} className="flex-grow bg-gray-100 dark:bg-gray-800 rounded-full px-4" placeholder="Message..." />
                                <Button onClick={handleSendMessage}><Icon name="send" /></Button>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'members' && (
                    <div className="p-4 space-y-2">
                        {group.members?.map((m, i) => (
                            <div key={i} className="flex justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                <span>{m.email.split('@')[0]}</span>
                                {m.uid === group.ownerUid && <span className="text-xs bg-amber-100 text-amber-600 px-2 rounded">Owner</span>}
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'info' && (
                    <div className="p-6">
                        <p>{group.description}</p>
                        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                            <div className="text-xs text-gray-500">Invite Link</div>
                            <div className="font-mono select-all">https://tradesnap-live.netlify.app/community/join?code={group.inviteCode}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const CommunityPage: React.FC<{ initialGroupId?: string, userProfile?: UserProfile }> = ({ initialGroupId, userProfile }) => {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    if (selectedGroup) return <PageWrapper><GroupPageInternal group={selectedGroup} userProfile={userProfile || null} onBack={() => setSelectedGroup(null)} /></PageWrapper>;
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

// --- PROFILE PAGE ---
export const ProfilePage: React.FC<{ profile: UserProfile, onProfileUpdate: any, onLogout: () => void }> = ({ profile, onProfileUpdate, onLogout }) => {
    const [edit, setEdit] = useState(profile);
    const [bio, setBio] = useState("Crypto enthusiast & day trader."); // Local state for now

    return (
        <PageWrapper className="max-w-3xl">
            <div className="bg-white dark:bg-[#111625] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                    <div className="relative group">
                        <Avatar avatar={edit.avatar} className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl" />
                        <div className="absolute bottom-0 right-0 bg-sky-500 text-white p-2 rounded-full border-4 border-white dark:border-gray-800"><Icon name="upload" className="h-4 w-4" /></div>
                    </div>
                    <div className="text-center md:text-left flex-grow">
                        <h2 className="text-3xl font-bold mb-1">{edit.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">@{edit.username} • Joined {new Date().toLocaleDateString()}</p>

                        {/* Progress Meter */}
                        <div className="mb-2 flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                            <span>Profile Completion</span>
                            <span>85%</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-sky-400 to-blue-600 w-[85%]" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Display Name</label>
                        <input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-sky-500 outline-none transition-colors" placeholder="Display Name" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Theme Color</label>
                        <ThemePicker current={edit.themeColor || '#0ea5e9'} onChange={(c) => setEdit({ ...edit, themeColor: c })} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Bio</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-sky-500 outline-none transition-colors min-h-[100px]" placeholder="Tell us about yourself..." />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button onClick={() => onProfileUpdate(edit)} className="flex-grow">Save Changes</Button>
                    <Button variant="danger" onClick={onLogout}>Logout</Button>
                </div>
            </div>
        </PageWrapper>
    );
};

// --- NEWS PAGE ---
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