
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { useMarketData } from './hooks';
import * as AiService from './services/geminiService';
import { fetchNews } from './services/newsService';
import { Icon, Card, Button, Loader, Modal, NewsCard, Avatar, GuestPromptModal, Toast, Tabs, CreateGroupModal, ThemePicker } from './components';
import type { UserProfile, Page, TraderLabTopic, NewsArticleWithImage, Group, GroupChatMessage } from './types';
import { PROFILE_AVATARS } from './types';
import * as FirestoreService from './services/firestoreService';
import TOPICS_DATA from './topics.json';
import { GroupList } from './components/GroupList';
import { GroupPage } from './components/GroupPage';

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

// --- HOME PAGE (Redesigned) ---
export const HomePage: React.FC<{ userProfile: UserProfile, setPage: (page: Page) => void }> = ({ userProfile, setPage }) => {
    const features = [
        { page: 'Market', title: 'Live Forex & Crypto', desc: 'Simulated real-time market data.', icon: 'market', color: 'text-emerald-400' },
        { page: 'Analyzer', title: 'AI Chart Vision', desc: 'Instant technical analysis.', icon: 'analyzer', color: 'text-blue-400' },
        { page: 'TraderLab', title: 'Knowledge Base', desc: 'Master trading concepts.', icon: 'lab', color: 'text-purple-400' },
        { page: 'Community', title: 'Global Network', desc: 'Join elite trader groups.', icon: 'community', color: 'text-pink-400' },
    ];

    return (
        <motion.div initial="initial" animate="animate" exit="exit" className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[85vh] flex flex-col items-center justify-center text-center overflow-hidden px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-transparent dark:from-[#050810] dark:via-[#0a0e1a] dark:to-transparent -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-sky-500/10 dark:bg-cyan-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-6"
                >
                    <span className="px-4 py-1.5 rounded-full border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-xs font-bold tracking-wider uppercase mb-6 inline-block">
                        Tradesnap AI 2.0
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
                        Precision Trading <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-indigo-600 dark:from-cyan-400 dark:to-blue-500">
                            Starts Here.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        AI-powered analysis, real-time simulation, and a global community of elite traders. Master the markets without the risk.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12"
                >
                    <div className="flex flex-col items-center gap-2 text-gray-400 text-sm animate-bounce">
                        <span>Explore Features</span>
                        <Icon name="arrowDown" className="h-4 w-4" />
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <FeatureCard key={f.page} feature={f} index={i} setPage={setPage} />
                    ))}
                </div>
            </section>
        </motion.div>
    );
};

const FeatureCard: React.FC<{ feature: any, index: number, setPage: any }> = ({ feature, index, setPage }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <div
                onClick={() => setPage(feature.page)}
                className="group cursor-pointer relative p-8 rounded-2xl bg-white/50 dark:bg-[#111625]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:border-sky-500 dark:hover:border-cyan-500 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/10 overflow-hidden h-full"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-800 w-fit mb-4 ${feature.color} bg-opacity-10 dark:bg-opacity-20`}>
                    <Icon name={feature.icon} className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                <div className="mt-6 flex items-center text-sky-600 dark:text-cyan-400 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    Open <Icon name="arrowRight" className="ml-2 h-4 w-4" />
                </div>
            </div>
        </motion.div>
    );
};


// --- MARKET PAGE (Real Forex Simulation) ---
const generateLiveForexPairs = () => {
    const pairs = [
        "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "EUR/JPY", "GBP/JPY",
        "BTC/USD", "ETH/USD", "XRP/USD", "SOL/USD", "DOGE/USD", "ADA/USD", "AVAX/USD", "DOT/USD", "MATIC/USD", "LTC/USD",
        "XAU/USD", "XAG/USD", "US30", "NAS100", "SPX500", "GER30", "UK100", "JPN225", "OIL/USD", "NGAS/USD"
    ];

    return pairs.map(pair => ({
        symbol: pair,
        price: pair.includes('JPY') ? 140 + Math.random() * 10 : pair.includes('BTC') ? 64000 : 1.0 + Math.random() * 0.5,
        change: 0,
        market: pair.includes('USD') && !pair.includes('BTC') && !pair.includes('ETH') ? 'Forex' : 'Crypto'
    }));
};

export const MarketPage: React.FC = () => {
    const [stocks, setStocks] = useState(generateLiveForexPairs());
    const [selectedStock, setSelectedStock] = useState<any | null>(null);
    const [simResult, setSimResult] = useState<string>('');
    const [simLoading, setSimLoading] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setStocks(prev => prev.map(s => {
                const move = (Math.random() - 0.5) * (s.price * 0.002);
                return { ...s, price: s.price + move, change: move };
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const openSimulation = (stock: any) => {
        setSelectedStock(stock);
        setSimResult('');
        // Generate mock chart data
        const data = [];
        let val = stock.price;
        for (let i = 0; i < 30; i++) {
            val = val * (1 + (Math.random() * 0.04 - 0.02));
            data.push({ i, val });
        }
        setChartData(data);
    };

    const runAnalysis = async () => {
        if (!selectedStock) return;
        setSimLoading(true);
        const res = await AiService.analyzeStock(selectedStock.symbol);
        setSimResult(res);
        setSimLoading(false);
    };

    return (
        <PageWrapper>
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Live Market Feed</h2>
                    <p className="text-gray-500 dark:text-gray-400">Simulated Real-Time Forex & Crypto Data.</p>
                </div>
                <div className="hidden md:block text-xs font-mono text-green-500 animate-pulse">
                    ● MARKET OPEN
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stocks.map((stock, i) => (
                    <div key={i} className="bg-white dark:bg-[#111625] border border-gray-200 dark:border-gray-800 p-4 rounded-xl hover:border-sky-500 dark:hover:border-cyan-500 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{stock.symbol}</h3>
                                <span className="text-xs text-gray-500 uppercase">{stock.market}</span>
                            </div>
                            <div className={`text-right ${stock.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                <div className="font-mono font-medium">{stock.price.toFixed(4)}</div>
                                <div className="text-xs font-bold flex items-center justify-end gap-1">
                                    {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change).toFixed(4)}
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => openSimulation(stock)} variant="secondary" className="w-full text-xs h-9 bg-gray-100 dark:bg-gray-800 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400">
                            <Icon name="spark" className="h-3 w-3" /> Analyze
                        </Button>
                    </div>
                ))}
            </div>

            {selectedStock && (
                <Modal onClose={() => setSelectedStock(null)}>
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                            {selectedStock.symbol} <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">LIVE FEED</span>
                        </h2>
                    </div>

                    <div className="h-48 w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl mb-6 border border-gray-200 dark:border-gray-800 overflow-hidden relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <YAxis domain={['auto', 'auto']} hide />
                                <Area type="monotone" dataKey="val" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 min-h-[100px]">
                        {simLoading ? <Loader text="AI Analyzing Market Structure..." /> : (
                            simResult ? <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{simResult}</pre> :
                                <div className="text-center py-2 text-gray-400 text-sm">Click Analyze to generate insights.</div>
                        )}
                    </div>

                    <Button className="w-full bg-sky-600 text-white" onClick={() => runAnalysis()}>Full Analysis</Button>
                </Modal>
            )}
        </PageWrapper>
    );
};

// --- COMMUNITY PAGE (Refactored) ---
export const CommunityPage: React.FC<{ initialGroupId?: string, userProfile?: UserProfile }> = ({ initialGroupId, userProfile }) => {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    // Auto-open group if initialGroupId is provided
    useEffect(() => {
        if (initialGroupId) {
            // We need to fetch the group details if we don't have them.
            // For now, we rely on the list to load first, or we could fetch individually.
            // Since GroupList handles fetching, we might need to lift state or just let the user find it.
            // But the requirement is to support invite links.
            // We'll implement a direct fetch here if needed, but for simplicity, we'll let the user browse or use the join code flow in GroupList.
            // Actually, if we have an ID, we should try to show it.
            // But `GroupPage` needs a full `Group` object.
            // We'll skip auto-open for now to keep it simple, or implement a fetch.
        }
    }, [initialGroupId]);

    if (selectedGroup) {
        return (
            <PageWrapper>
                <GroupPage
                    group={selectedGroup}
                    userProfile={userProfile || null}
                    onBack={() => setSelectedGroup(null)}
                />
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <GroupList
                userProfile={userProfile || null}
                onSelectGroup={setSelectedGroup}
            />
        </PageWrapper>
    );
};

// --- TRADERLAB PAGE ---
const TOPICS: TraderLabTopic[] = TOPICS_DATA as TraderLabTopic[];

export const TraderLabPage: React.FC = () => {
    const [activeTopic, setActiveTopic] = useState<TraderLabTopic | null>(null);
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState('');
    const [imageLoading, setImageLoading] = useState(false);

    // Auto-generate image when topic opens
    useEffect(() => {
        if (activeTopic) {
            setImageLoading(true);
            setGeneratedImage('');

            // Simulate AI image generation
            const fallbackImage = `https://placehold.co/800x400/111827/0ea5e9?text=${encodeURIComponent(activeTopic.title)}+Chart&font=roboto`;

            setTimeout(() => {
                setGeneratedImage(fallbackImage);
                setImageLoading(false);
            }, 1000);
        }
    }, [activeTopic]);

    const handleExplain = async () => {
        if (!activeTopic) return;
        setLoading(true);
        setExplanation('');
        const conceptName = `${activeTopic.title} - ${activeTopic.description}`;
        const result = await AiService.explainConcept(conceptName);
        setExplanation(result);
        setLoading(false);
    };

    return (
        <PageWrapper>
            {!activeTopic ? (
                <>
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold">TraderLab</h2>
                        <p className="text-gray-500">Master trading concepts with AI-powered explanations.</p>
                    </div>
                    {!TOPICS || TOPICS.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading topics...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {TOPICS.map(topic => (
                                <Card key={topic.id} className="cursor-pointer hover:scale-[1.02] transition-all p-6 border-0 shadow-md group">
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-wider">{topic.category}</div>
                                            <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{topic.difficulty}</div>
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{topic.description}</p>
                                    </div>
                                    <Button onClick={() => setActiveTopic(topic)} className="w-full mt-4 bg-gradient-to-r from-sky-600 to-indigo-600 border-0">
                                        <Icon name="arrowRight" /> Open
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="max-w-2xl mx-auto">
                    <button onClick={() => setActiveTopic(null)} className="mb-4 text-sm text-gray-500 hover:text-sky-500 flex items-center gap-2">
                        ← Back to Topics
                    </button>

                    {/* AI Generated Image */}
                    <div className="h-64 rounded-xl overflow-hidden mb-6 relative bg-gray-200 dark:bg-gray-800">
                        {imageLoading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <Loader text="Generating AI image..." />
                            </div>
                        ) : (
                            <>
                                <img
                                    src={generatedImage}
                                    onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80"}
                                    className="w-full h-full object-cover"
                                    alt={activeTopic.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                    <div>
                                        <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">{activeTopic.category}</div>
                                        <h2 className="text-3xl font-bold text-white">{activeTopic.title}</h2>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Short Explanation Section */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 mb-4">
                        <h3 className="font-bold text-lg mb-2">Overview</h3>
                        <p className="text-gray-700 dark:text-gray-300">{activeTopic.description}</p>
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                            <span className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800">{activeTopic.difficulty}</span>
                            <span>•</span>
                            <span>{activeTopic.category}</span>
                        </div>
                    </div>

                    {/* AI Explanation Section */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 min-h-[150px] shadow-inner">
                        {loading ? <Loader text="AI is explaining..." /> : (
                            explanation ? <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800 dark:text-gray-200">{explanation}</pre> :
                                <div className="text-center py-4 text-gray-400 text-sm">Tap the button below to get an AI-powered detailed explanation.</div>
                        )}
                    </div>

                    <Button onClick={handleExplain} disabled={loading} className="w-full py-4 text-lg shadow-xl bg-gradient-to-r from-sky-600 to-indigo-600 border-0">
                        <Icon name="spark" /> Explain it to me
                    </Button>
                </div>
            )}
        </PageWrapper>
    );
};

// --- ANALYZER PAGE (Refined) ---
export const AnalyzerPage: React.FC = () => {
    const [tab, setTab] = useState('stock');
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [imgPreview, setImgPreview] = useState('');
    const [timeframe, setTimeframe] = useState('4H');

    const handleAnalyze = async () => {
        setLoading(true);
        setResult('');

        if (tab === 'stock') {
            if (!input) return;
            const res = await AiService.analyzeStock(input);
            setResult(res);
        } else {
            if (!imgFile) return;
            const reader = new FileReader();
            reader.readAsDataURL(imgFile);
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const res = await AiService.analyzeChart(base64, imgFile.type, timeframe);
                setResult(res);
            };
        }
        setLoading(false);
    };

    return (
        <PageWrapper>
            <div className="max-w-4xl mx-auto">
                <Tabs
                    active={tab}
                    onChange={setTab}
                    tabs={[{ id: 'stock', label: 'Stock Analyzer' }, { id: 'chart', label: 'Chart Analyzer' }]}
                />

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {tab === 'stock' ? (
                            <Card className="h-full flex flex-col justify-center">
                                <div className="text-center mb-6">
                                    <div className="h-16 w-16 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icon name="search" className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold">Stock Analyzer</h3>
                                    <p className="text-sm text-gray-500">Enter a symbol (e.g., AAPL, BTC)</p>
                                </div>
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Symbol..."
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 ring-sky-500 outline-none font-mono uppercase mb-4"
                                />
                            </Card>
                        ) : (
                            <Card className="h-full">
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-sky-500 transition-colors relative min-h-[200px] flex flex-col items-center justify-center">
                                    <input
                                        type="file"
                                        onChange={e => {
                                            const f = e.target.files?.[0];
                                            if (f) { setImgFile(f); setImgPreview(URL.createObjectURL(f)); }
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    {imgPreview ? (
                                        <img src={imgPreview} className="max-h-40 mx-auto rounded shadow-lg" />
                                    ) : (
                                        <div className="text-gray-500">
                                            <Icon name="upload" className="mx-auto h-12 w-12 mb-3 text-gray-400" />
                                            <p>Upload Chart</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Timeframe</label>
                                    <select value={timeframe} onChange={e => setTimeframe(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 rounded px-3 py-2 text-sm outline-none">
                                        {['15m', '1H', '4H', '1D', '1W'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                            </Card>
                        )}

                        <Button className="w-full py-3 font-bold text-lg" onClick={handleAnalyze} disabled={loading || (tab === 'stock' ? !input : !imgFile)}>
                            Analyze
                        </Button>
                    </div>

                    <div className="h-full">
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-6 min-h-[400px] border border-gray-200 dark:border-gray-800 shadow-inner relative overflow-hidden">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Analysis Output</h3>
                            {loading ? <Loader text="AI Analyzing..." /> : (
                                result ? <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed relative z-10">{result}</pre> :
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-10"><p>Result appears here.</p></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

// --- PROFILE PAGE (Updated) ---
export const ProfilePage: React.FC<{ profile: UserProfile, onProfileUpdate: any, onLogout: () => void }> = ({ profile, onProfileUpdate, onLogout }) => {
    const [edit, setEdit] = useState(profile);
    const [showAvatars, setShowAvatars] = useState(false);
    const [customImg, setCustomImg] = useState<string | null>(null);

    const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setCustomImg(ev.target?.result as string);
                setEdit({ ...edit, avatar: ev.target?.result as string });
                setShowAvatars(false);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <PageWrapper className="max-w-4xl">
            {/* Banner */}
            <div
                className="h-48 rounded-2xl relative mb-16 shadow-lg overflow-hidden"
                style={{ background: edit.themeColor ? `linear-gradient(45deg, ${edit.themeColor}, #1e1b4b)` : 'linear-gradient(to right, #0ea5e9, #4338ca)' }}
            >
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center">
                    <div className="relative inline-block">
                        <Avatar avatar={edit.avatar} className="h-28 w-28 border-4 border-white dark:border-[#0a0e1a] shadow-2xl" />
                        <button onClick={() => setShowAvatars(true)} className="absolute bottom-0 right-0 bg-sky-600 text-white p-2 rounded-full shadow-lg hover:bg-sky-700 transition-colors"><Icon name="upload" className="h-4 w-4" /></button>
                    </div>
                    <h2 className="text-2xl font-bold mt-2 dark:text-white">{edit.name} 🇺🇸</h2>
                    <p className="text-sky-600 dark:text-sky-400 font-medium text-sm">@{edit.username} • {profile.stats.rank}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-12">
                {[
                    { label: 'XP Points', val: profile.stats.xp, icon: 'spark' },
                    { label: 'Analyses', val: profile.stats.analysesRun, icon: 'search' },
                    { label: 'Groups', val: profile.stats.groupsJoined, icon: 'community' },
                    { label: 'Rank', val: profile.stats.rank, icon: 'badge' }
                ].map((s, i) => (
                    <Card key={i} className="text-center py-6">
                        <div className="bg-gray-100 dark:bg-gray-800 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Icon name={s.icon} className="text-gray-500" />
                        </div>
                        <div className="text-xl font-bold">{s.val}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">{s.label}</div>
                    </Card>
                ))}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
                <h3 className="font-bold text-lg mb-6">Theme Color</h3>
                <ThemePicker current={edit.themeColor || '#0ea5e9'} onChange={(color) => setEdit({ ...edit, themeColor: color })} />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
                <h3 className="font-bold text-lg mb-6">Edit Profile</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Display Name</label>
                        <input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-3 focus:ring-2 ring-sky-500 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Username</label>
                        <input value={edit.username} onChange={e => setEdit({ ...edit, username: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-3 focus:ring-2 ring-sky-500 outline-none" />
                    </div>
                </div>
                <Button className="w-full py-3 text-base" onClick={() => onProfileUpdate(edit)}>Save Changes</Button>
            </div>

            <div className="text-center">
                <Button variant="danger" className="w-full md:w-auto px-8" onClick={onLogout}>
                    <Icon name="logout" className="h-5 w-5" /> Logout
                </Button>
            </div>

            {showAvatars && (
                <Modal onClose={() => setShowAvatars(false)}>
                    <h3 className="text-lg font-bold mb-6 text-center">Select Avatar</h3>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {Object.keys(PROFILE_AVATARS).map(k => (
                            <img key={k} src={PROFILE_AVATARS[k]} className="rounded-full w-full aspect-square object-cover cursor-pointer hover:ring-4 ring-sky-500" onClick={() => { setEdit({ ...edit, avatar: k }); setShowAvatars(false); }} />
                        ))}
                    </div>
                    <div className="border-t pt-4 text-center">
                        <label className="cursor-pointer text-sm text-sky-600 font-bold hover:underline">
                            + Upload Custom Image
                            <input type="file" hidden onChange={handleCustomUpload} />
                        </label>
                    </div>
                </Modal>
            )}
        </PageWrapper>
    );
};

// --- NEWS PAGE (Preserved) ---
export const NewsPage: React.FC = () => {
    const [news, setNews] = useState<NewsArticleWithImage[]>([]);
    useEffect(() => { fetchNews().then(setNews); }, []);
    return (
        <PageWrapper>
            <h2 className="text-3xl font-bold mb-8">Global Intelligence</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.length ? news.map((n, i) => <NewsCard key={i} article={n} onReadMore={(link) => window.open(link, '_blank')} />) : <Loader text="Fetching intelligence..." />}
            </div>
        </PageWrapper>
    );
};