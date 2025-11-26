import React, { useState, useEffect } from 'react';
import { PageWrapper } from './PageWrapper';
import { Button, Modal, Loader } from '../components';
import * as AiService from '../services/geminiService';

const STOCK_LIST = [
    { symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ', price: 175.84 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', market: 'NASDAQ', price: 245.60 },
    { symbol: 'NVDA', name: 'NVIDIA Corp', market: 'NASDAQ', price: 460.10 },
    { symbol: 'META', name: 'Meta Platforms', market: 'NASDAQ', price: 300.21 },
    { symbol: 'GOOG', name: 'Alphabet Inc.', market: 'NASDAQ', price: 135.40 },
    { symbol: 'AMZN', name: 'Amazon.com', market: 'NASDAQ', price: 145.20 },
    { symbol: 'MSFT', name: 'Microsoft', market: 'NASDAQ', price: 330.55 },
    { symbol: 'JPM', name: 'JPMorgan Chase', market: 'NYSE', price: 148.00 },
    { symbol: 'BAC', name: 'Bank of America', market: 'NYSE', price: 28.50 },
    { symbol: 'KO', name: 'Coca-Cola', market: 'NYSE', price: 58.20 },
    { symbol: 'PEP', name: 'PepsiCo', market: 'NASDAQ', price: 165.40 },
    { symbol: 'ORCL', name: 'Oracle', market: 'NYSE', price: 112.30 },
    { symbol: 'IBM', name: 'IBM Corp', market: 'NYSE', price: 145.60 },
    { symbol: 'NFLX', name: 'Netflix', market: 'NASDAQ', price: 440.50 },
    { symbol: 'DIS', name: 'Disney', market: 'NYSE', price: 85.40 },
    { symbol: 'V', name: 'Visa', market: 'NYSE', price: 245.10 },
    { symbol: 'MA', name: 'Mastercard', market: 'NYSE', price: 410.20 },
    { symbol: 'PYPL', name: 'PayPal', market: 'NASDAQ', price: 58.90 },
    { symbol: 'TSM', name: 'TSMC', market: 'NYSE', price: 95.40 },
    { symbol: 'BABA', name: 'Alibaba', market: 'NYSE', price: 85.20 },
    { symbol: 'SHOP', name: 'Shopify', market: 'NYSE', price: 60.50 },
    { symbol: 'NKE', name: 'Nike', market: 'NYSE', price: 105.40 },
    { symbol: 'PLTR', name: 'Palantir', market: 'NYSE', price: 18.50 },
    { symbol: 'QCOM', name: 'Qualcomm', market: 'NASDAQ', price: 120.40 },
    { symbol: 'AMD', name: 'AMD', market: 'NASDAQ', price: 115.60 },
    { symbol: 'INTC', name: 'Intel', market: 'NASDAQ', price: 38.50 },
    { symbol: 'CSCO', name: 'Cisco', market: 'NASDAQ', price: 55.20 },
    { symbol: 'CRM', name: 'Salesforce', market: 'NYSE', price: 220.40 },
    { symbol: 'WMT', name: 'Walmart', market: 'NYSE', price: 160.50 },
    { symbol: 'TGT', name: 'Target', market: 'NYSE', price: 125.40 },
    { symbol: 'COST', name: 'Costco', market: 'NASDAQ', price: 560.20 },
    { symbol: 'HD', name: 'Home Depot', market: 'NYSE', price: 320.50 },
    { symbol: 'LOW', name: 'Lowe\'s', market: 'NYSE', price: 210.40 },
    { symbol: 'XOM', name: 'Exxon Mobil', market: 'NYSE', price: 115.20 },
    { symbol: 'CVX', name: 'Chevron', market: 'NYSE', price: 160.40 },
    { symbol: 'BP', name: 'BP plc', market: 'NYSE', price: 38.50 },
    { symbol: 'SHEL', name: 'Shell', market: 'NYSE', price: 65.40 },
    { symbol: 'UBER', name: 'Uber', market: 'NYSE', price: 48.50 },
    { symbol: 'ABNB', name: 'Airbnb', market: 'NASDAQ', price: 135.20 },
    { symbol: 'SQ', name: 'Block', market: 'NYSE', price: 55.40 },
    { symbol: 'COIN', name: 'Coinbase', market: 'NASDAQ', price: 85.20 },
    { symbol: 'HOOD', name: 'Robinhood', market: 'NASDAQ', price: 10.50 },
    { symbol: 'RBLX', name: 'Roblox', market: 'NYSE', price: 35.40 },
    { symbol: 'U', name: 'Unity', market: 'NYSE', price: 30.20 },
    { symbol: 'DKNG', name: 'DraftKings', market: 'NASDAQ', price: 32.50 },
    { symbol: 'PFE', name: 'Pfizer', market: 'NYSE', price: 32.40 },
    { symbol: 'MRNA', name: 'Moderna', market: 'NASDAQ', price: 85.20 },
    { symbol: 'JNJ', name: 'Johnson & Johnson', market: 'NYSE', price: 155.40 },
    { symbol: 'UNH', name: 'UnitedHealth', market: 'NYSE', price: 480.20 },
    { symbol: 'LLY', name: 'Eli Lilly', market: 'NYSE', price: 580.40 }
];

export const MarketPage: React.FC = () => {
    const [stocks, setStocks] = useState(STOCK_LIST);
    const [selectedStock, setSelectedStock] = useState<any>(null);
    const [simResult, setSimResult] = useState('');
    const [simLoading, setSimLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setStocks(prev => prev.map(s => ({
                ...s,
                price: s.price * (1 + (Math.random() * 0.002 - 0.001))
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const runAnalysis = async () => {
        if (!selectedStock) return;
        setSimLoading(true);
        try {
            const res = await AiService.analyzeStock(selectedStock.symbol);
            setSimResult(res);
        } catch (e) {
            setSimResult("Analysis failed. Please try again.");
        }
        setSimLoading(false);
    };

    return (
        <PageWrapper>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Live Market Feed</h2>
                <p className="text-gray-400 mt-2">Real-time prices for top 50+ business stocks.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {stocks.map((stock, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl hover:border-sky-500 transition-all hover:-translate-y-1 group">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-lg text-white group-hover:text-sky-400 transition-colors">{stock.symbol}</h3>
                                <div className="text-xs text-gray-500 uppercase truncate max-w-[100px]" title={stock.name}>{stock.name}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono font-medium text-emerald-400">${stock.price.toFixed(2)}</div>
                                <div className="text-[10px] text-gray-500">{stock.market}</div>
                            </div>
                        </div>
                        <Button
                            onClick={() => setSelectedStock(stock)}
                            variant="secondary"
                            className="w-full text-xs h-8 bg-white/5 hover:bg-sky-500 hover:text-white border-none"
                        >
                            Analyze
                        </Button>
                    </div>
                ))}
            </div>

            {selectedStock && (
                <Modal onClose={() => setSelectedStock(null)}>
                    <h2 className="text-2xl font-bold mb-4 text-white">{selectedStock.symbol} Analysis</h2>
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-gray-800 mb-6 min-h-[100px] max-h-[60vh] overflow-y-auto">
                        {simLoading ? (
                            <Loader text="AI Analyzing..." />
                        ) : (
                            simResult ? (
                                <pre className="whitespace-pre-wrap font-mono text-xs text-gray-300">{simResult}</pre>
                            ) : (
                                <div className="text-center text-gray-400 text-sm py-8">
                                    Click "Run Analysis" to generate AI insights for {selectedStock.name}.
                                </div>
                            )
                        )}
                    </div>
                    <Button className="w-full" onClick={runAnalysis} disabled={simLoading}>
                        {simLoading ? 'Analyzing...' : 'Run Analysis'}
                    </Button>
                </Modal>
            )}
        </PageWrapper>
    );
};

export default MarketPage;
