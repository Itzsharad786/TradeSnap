import React, { useState, useEffect } from 'react';
import { PageWrapper } from './PageWrapper';
import { Button, Modal, Loader } from '../components';
import * as AiService from '../services/geminiService';

export const MarketPage: React.FC = () => {
    const [stocks, setStocks] = useState([
        { symbol: 'AAPL', price: 150.25, market: 'NASDAQ' },
        { symbol: 'TSLA', price: 245.60, market: 'NASDAQ' },
        { symbol: 'BTC-USD', price: 42150.00, market: 'CRYPTO' },
        { symbol: 'EUR/USD', price: 1.0850, market: 'FOREX' },
        { symbol: 'NVDA', price: 460.10, market: 'NASDAQ' },
        { symbol: 'ETH-USD', price: 2250.00, market: 'CRYPTO' },
    ]);
    const [selectedStock, setSelectedStock] = useState<any>(null);
    const [simResult, setSimResult] = useState('');
    const [simLoading, setSimLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setStocks(prev => prev.map(s => ({ ...s, price: s.price * (1 + (Math.random() * 0.002 - 0.001)) })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const runAnalysis = async () => {
        if (!selectedStock) return;
        setSimLoading(true);
        const res = await AiService.analyzeStock(selectedStock.symbol);
        setSimResult(res);
        setSimLoading(false);
    };

    return (
        <PageWrapper>
            <div className="mb-8"><h2 className="text-3xl font-bold">Live Market Feed</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stocks.map((stock, i) => (
                    <div key={i} className="bg-white dark:bg-[#111625] border border-gray-200 dark:border-gray-800 p-4 rounded-xl hover:border-sky-500 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div><h3 className="font-bold text-lg">{stock.symbol}</h3><span className="text-xs text-gray-500 uppercase">{stock.market}</span></div>
                            <div className="text-right text-emerald-500"><div className="font-mono font-medium">{stock.price.toFixed(4)}</div></div>
                        </div>
                        <Button onClick={() => setSelectedStock(stock)} variant="secondary" className="w-full text-xs h-9">Analyze</Button>
                    </div>
                ))}
            </div>
            {selectedStock && (
                <Modal onClose={() => setSelectedStock(null)}>
                    <h2 className="text-2xl font-bold mb-4">{selectedStock.symbol} Analysis</h2>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 min-h-[100px]">
                        {simLoading ? <Loader text="AI Analyzing..." /> : (simResult ? <pre className="whitespace-pre-wrap font-mono text-xs">{simResult}</pre> : <div className="text-center text-gray-400 text-sm">Click Analyze.</div>)}
                    </div>
                    <Button className="w-full" onClick={runAnalysis}>Run Analysis</Button>
                </Modal>
            )}
        </PageWrapper>
    );
};

export default MarketPage;
