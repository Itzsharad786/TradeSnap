import React, { useState, useEffect } from 'react';
import { PageWrapper } from './PageWrapper';
import { Icon } from '../components';

interface NewsArticle {
    title: string;
    source: string;
    time: string;
    content?: string;
    link?: string;
}

interface NewsPageProps {
    onArticleSelect: (article: NewsArticle) => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ onArticleSelect }) => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        // Simulate fetching news
        setTimeout(() => {
            setNews([
                { title: "Fed Signals Potential Rate Cuts Later This Year", source: "Bloomberg", time: "2h ago" },
                { title: "Bitcoin Surges Past $65,000 as ETF Inflows Accelerate", source: "CoinDesk", time: "3h ago" },
                { title: "NVIDIA Earnings Blow Past Estimates, AI Boom Continues", source: "Reuters", time: "4h ago" },
                { title: "Oil Prices Stabilize Amid Middle East Tensions", source: "CNBC", time: "5h ago" },
                { title: "Tesla Announces New Gigafactory in Mexico", source: "TechCrunch", time: "6h ago" },
                { title: "Apple Vision Pro Sales Exceed Expectations", source: "The Verge", time: "7h ago" },
                { title: "European Markets Close Higher on Tech Rally", source: "Financial Times", time: "8h ago" },
                { title: "Gold Reaches All-Time High as Investors Seek Safety", source: "MarketWatch", time: "9h ago" },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const categories = ['All', 'Top Stories', 'Stocks', 'Crypto', 'Economy'];

    return (
        <PageWrapper>
            <div className="mb-8 px-2">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Market News</h2>
                <p className="text-gray-400">Latest updates from global financial markets.</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === cat
                                ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                                : 'bg-[#0f172a] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-[#0f172a] rounded-xl animate-pulse border border-gray-800"></div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4">
                    {news.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => onArticleSelect(item)}
                            className="bg-[#0f172a] p-6 rounded-xl border border-gray-800 hover:border-sky-500/50 hover:bg-gray-900/50 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sky-400 text-xs font-bold uppercase tracking-wider">{item.source}</span>
                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                    <Icon name="clock" className="h-3 w-3" /> {item.time}
                                </span>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-sky-400 transition-colors leading-snug">
                                {item.title}
                            </h3>
                        </div>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
};

export default NewsPage;
