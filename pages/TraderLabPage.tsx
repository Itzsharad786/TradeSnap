import React, { useState } from 'react';
import { PageWrapper } from './PageWrapper';
import { Card, Button, Loader } from '../components';
import * as AiService from '../services/geminiService';
import type { TraderLabTopic } from '../types';
import TOPICS_DATA from '../topics.json';

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

export default TraderLabPage;
