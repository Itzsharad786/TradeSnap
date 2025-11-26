import React from 'react';
import { PageWrapper } from './PageWrapper';
import { Button, Icon } from '../components';
import type { NewsArticleWithImage } from '../types';

interface FullNewsPageProps {
    article: NewsArticleWithImage | null;
    onBack: () => void;
}

export const FullNewsPage: React.FC<FullNewsPageProps> = ({ article, onBack }) => {
    if (!article) return null;

    // Mock full content since RSS only gives snippets
    const fullContent = `
        ${article.description}

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
    `;

    return (
        <PageWrapper>
            <div className="max-w-3xl mx-auto">
                <Button onClick={onBack} variant="secondary" className="mb-6">
                    <Icon name="arrow-left" className="mr-2 h-4 w-4" /> Back to News
                </Button>

                <article className="bg-[#0f172a] p-8 rounded-2xl border border-gray-800 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-xs font-medium uppercase tracking-wider">
                            {article.source}
                        </span>
                        <span className="text-gray-500 text-sm">
                            {new Date(article.publishedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                        {article.title}
                    </h1>

                    <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed whitespace-pre-line">
                        {fullContent}
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-800">
                        <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors font-medium"
                        >
                            Read original article at {article.source} <Icon name="external-link" className="ml-2 h-4 w-4" />
                        </a>
                    </div>
                </article>
            </div>
        </PageWrapper>
    );
};

export default FullNewsPage;
