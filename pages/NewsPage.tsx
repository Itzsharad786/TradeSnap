import React, { useState, useEffect } from 'react';
import { PageWrapper } from './PageWrapper';
import { Loader, Button } from '../components';
import { fetchNews } from '../services/newsService';
import type { NewsArticleWithImage } from '../types';

interface NewsPageProps {
    onArticleSelect: (article: NewsArticleWithImage) => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ onArticleSelect }) => {
    const [news, setNews] = useState<NewsArticleWithImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'All' | 'Top Stories' | 'Stocks' | 'ETFs'>('All');

    useEffect(() => {
        setLoading(true);
        fetchNews().then(data => {
            setNews(data);
            setLoading(false);
        });
    }, []);

    return (
        <PageWrapper>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Market News</h2>
                <p className="text-gray-400">Latest updates from the financial world.</p>
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'Top Stories', 'Stocks', 'ETFs'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat as any)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === cat
                                ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <Loader text="Loading News..." />
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {news.map((n, i) => (
                        <div
                            key={i}
                            onClick={() => onArticleSelect(n)}
                            className="bg-[#0f172a] p-6 rounded-xl border border-gray-800 hover:border-sky-500/50 hover:bg-gray-900 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-800/50 px-2 py-1 rounded">
                                    {n.source}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(n.publishedAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-sky-400 transition-colors leading-snug">
                                {n.title}
                            </h3>

                            <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                                {n.description}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
};

export default NewsPage;
