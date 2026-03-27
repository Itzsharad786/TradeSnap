import React, { useState } from 'react';
import { PageWrapper } from './PageWrapper';
import { Card } from '../components';
import type { TraderLabTopic } from '../types';
import TOPICS_DATA from '../topics.json';

const TOPICS: TraderLabTopic[] = TOPICS_DATA as TraderLabTopic[];

const getTopicContextLines = (topic: TraderLabTopic): string[] => {
    const title = topic.title.toLowerCase();

    const categoryFocus = topic.category === 'SMC'
        ? 'Track structure, liquidity, and institutional footprints before taking entries.'
        : topic.category === 'Price Action'
            ? 'Read candles and levels first; indicators should only confirm your idea.'
            : 'Protect psychology first, because mindset controls execution quality.';

    const specificTrigger =
        title.includes('order block') ? 'Mark the last opposite candle before displacement and wait for clean revisit.' :
            title.includes('fvg') || title.includes('fair value') ? 'Use the imbalance midpoint as a reaction zone, not a blind entry.' :
                title.includes('liquidity') ? 'Watch equal highs/lows and session highs/lows where stops usually sit.' :
                    title.includes('bos') ? 'Confirm with decisive body close beyond swing, not just wick break.' :
                        title.includes('choch') ? 'Treat first structure flip as early warning, then wait for confirmation.' :
                            title.includes('support') || title.includes('resistance') ? 'Respect repeated reactions at key levels and avoid mid-range entries.' :
                                title.includes('candlestick') ? 'Use candle context with location; pattern alone is never enough.' :
                                    title.includes('risk management') ? 'Fix risk per trade first, then size position based on stop distance.' :
                                        title.includes('psychology') || title.includes('fomo') || title.includes('discipline') ? 'Build rule-based execution to reduce emotional decision making.' :
                                            'Wait for alignment between trend, level, and timing before executing.';

    const lines = [
        `${topic.title}: ${topic.description}.`,
        `Core focus (${topic.category}, ${topic.difficulty}): ${categoryFocus}`,
        `Execution trigger: ${specificTrigger}`,
        'Confirmation checklist: structure + reaction + momentum shift should align on your timeframe.',
        'Risk rule: place stop-loss where your setup is invalidated, not where loss feels small.',
        'Target logic: scale at key liquidity or structure points and maintain at least 1:2 reward-to-risk.',
        'Invalidation signal: if price breaks your thesis level with strength, exit fast and reassess.',
        'Common mistake: entering too early without confirmation or chasing after the move already ran.',
        'Practice task: replay 20 charts and tag valid vs invalid setups for this topic with screenshots.',
        'Pro context: combine this topic with session timing and higher-timeframe bias for better consistency.'
    ];

    return lines;
};

export const TraderLabPage: React.FC = () => {
    const [activeTopic, setActiveTopic] = useState<TraderLabTopic | null>(null);

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
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl mb-6">
                        <div className="flex gap-2 mb-4">
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300">
                                {activeTopic.category}
                            </span>
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300">
                                {activeTopic.difficulty}
                            </span>
                        </div>
                        <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed list-decimal list-inside">
                            {getTopicContextLines(activeTopic).map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
};

export default TraderLabPage;
