import React, { useState } from 'react';
import { PageWrapper } from './PageWrapper';
import { Button } from '../components';
import * as AiService from '../services/geminiService';

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

export default AnalyzerPage;
