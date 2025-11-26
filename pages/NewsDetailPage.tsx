import React from 'react';
import { PageWrapper } from './PageWrapper';
import { Icon } from '../components';

interface NewsArticle {
    title: string;
    source: string;
    time: string;
    content?: string;
    link?: string;
}

interface NewsDetailPageProps {
    article: NewsArticle | null;
    onBack: () => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ article, onBack }) => {
    if (!article) return null;

    return (
        <PageWrapper>
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={onBack}
                    className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors group"
                >
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 mr-3 transition-all">
                        <Icon name="arrowDown" className="h-5 w-5 rotate-90" />
                    </div>
                    <span className="font-medium">Back to News</span>
                </button>

                <article className="bg-[#0f172a] rounded-3xl p-8 border border-gray-800 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-sky-500/10 text-sky-400 text-sm font-bold rounded-full border border-sky-500/20">
                            {article.source}
                        </span>
                        <span className="text-gray-500 text-sm flex items-center gap-1">
                            <Icon name="clock" className="h-3 w-3" /> {article.time}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-white mb-8 leading-tight">
                        {article.title}
                    </h1>

                    <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed space-y-6">
                        <p>
                            {article.content || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}
                        </p>
                        <p>
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                        </p>
                        <p>
                            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
                        </p>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-800 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Original source: {article.source}
                        </div>
                        <a
                            href={article.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                        >
                            Read Original <Icon name="external-link" className="h-4 w-4" />
                        </a>
                    </div>
                </article>
            </div>
        </PageWrapper>
    );
};
