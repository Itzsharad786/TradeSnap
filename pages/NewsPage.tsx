import React, { useState, useEffect } from 'react';
import { PageWrapper } from './PageWrapper';
import { NewsCard } from '../components';
import { fetchNews } from '../services/newsService';
import type { NewsArticleWithImage } from '../types';

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

export default NewsPage;
