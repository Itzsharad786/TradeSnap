
import type { RssArticle, NewsArticleWithImage } from '../types';

const RSS_FEEDS = [
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=AAPL',
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=RELIANCE.NS',
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=TSLA',
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=BTC-USD',
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=NVDA',
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=GOOG',
    'https://rss.app/feeds/wLIIQ02sL24qolMK.xml', // Crypto news
    'https://rss.app/feeds/3LvxN4HpzJSy2fVw.xml' // Market news
];

const getArticleCategory = (title: string): 'crypto' | 'finance' | 'default' => {
    const lowerTitle = title.toLowerCase();
    if (['btc', 'bitcoin', 'crypto', 'eth', 'binance', 'coinbase'].some(kw => lowerTitle.includes(kw))) return 'crypto';
    if (['fed', 'inflation', 'rates', 'banking', 'finance', 'stocks', 'market'].some(kw => lowerTitle.includes(kw))) return 'finance';
    return 'default';
};

export async function fetchNews(): Promise<NewsArticleWithImage[]> {
    try {
        const feedPromises = RSS_FEEDS.map(async (feedUrl) => {
            try {
                const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
                if (!response.ok) return [];
                const data = await response.json();
                if (data.status !== 'ok') return [];
                return data.items as RssArticle[];
            } catch (error) {
                console.warn(`Error fetching RSS feed ${feedUrl}:`, error);
                return [];
            }
        });

        const rssResults = (await Promise.all(feedPromises)).flat();
        const uniqueRssArticles = Array.from(new Map(rssResults.map(item => [item.link, item])).values());

        const allItems = uniqueRssArticles.map((item): NewsArticleWithImage => {
            const source = new URL(item.link).hostname.replace('www.', '');
            const category = getArticleCategory(item.title);

            return {
                title: item.title,
                link: item.link,
                publishedAt: item.isoDate || item.pubDate,
                description: item.contentSnippet,
                image: `https://image.thum.io/get/width/600/${encodeURIComponent(item.link)}`,
                source: source,
                category: category,
            };
        });
        
        return allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    } catch (error) {
        console.error("Failed to fetch or process news feeds:", error);
        return [];
    }
}
