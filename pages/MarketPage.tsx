import React, { useState, useEffect } from 'react';
import { PageWrapper } from './PageWrapper';
import { Icon } from '../components';

// Top 50 Stocks List
const STOCK_LIST = [
    'AAPL', 'TSLA', 'META', 'NVDA', 'AMD', 'AMZN', 'GOOG', 'NFLX', 'MSFT', 'JPM',
    'V', 'MA', 'BAC', 'WMT', 'TSM', 'ORCL', 'INTC', 'KO', 'PEP', 'COST',
    'DIS', 'NKE', 'XOM', 'CVX', 'PFE', 'CSCO', 'ABBV', 'MRK', 'AVGO', 'ACN',
    'ADBE', 'CRM', 'MCD', 'DHR', 'LIN', 'ABT', 'TM', 'NVO', 'ASML', 'BABA',
    'PDD', 'JD', 'BIDU', 'NIO', 'PLTR', 'COIN', 'HOOD', 'RBLX', 'U', 'DKNG'
];

interface StockData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    exchange: string;
}

export const MarketPage: React.FC = () => {
    const [stocks, setStocks] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);

    // Simulate fetching real-time data
    useEffect(() => {
        const initialData = STOCK_LIST.map(sym => ({
            symbol: sym,
            price: Math.random() * 500 + 20,
            change: 0,
            changePercent: 0,
            exchange: 'NASDAQ'
        }));
        setStocks(initialData);
        setLoading(false);

        const interval = setInterval(() => {
            setStocks(prev => prev.map(stock => {
                const move = (Math.random() - 0.5) * 2; // Random move between -1 and 1
                const newPrice = Math.max(1, stock.price + move);
                const change = newPrice - stock.price;
                return {
                    ...stock,
                    price: newPrice,
                    change: change,
                    changePercent: (change / stock.price) * 100,
                    exchange: ['JPM', 'BAC', 'WMT', 'KO', 'PEP', 'XOM', 'CVX', 'PFE', 'MCD', 'NKE', 'DIS'].includes(stock.symbol) ? 'NYSE' : 'NASDAQ'
                };
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <PageWrapper>
            <div className="mb-8 px-2">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Live Market</h2>
                <p className="text-gray-400">Real-time data for top 50 global assets.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {stocks.map((stock) => (
                        <div key={stock.symbol} className="bg-[#0f172a] p-5 rounded-xl border border-gray-800 hover:border-sky-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">{stock.symbol}</h3>
                                    <span className="text-xs text-gray-500 font-medium bg-gray-800 px-2 py-0.5 rounded">{stock.exchange}</span>
                                </div>
                                <div className={`text-right ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    <div className="text-lg font-mono font-bold">${stock.price.toFixed(2)}</div>
                                    <div className="text-xs font-medium flex items-center justify-end gap-1">
                                        <Icon name={stock.change >= 0 ? 'trending-up' : 'trending-down'} className="h-3 w-3" />
                                        {stock.change > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-2 bg-gray-800 hover:bg-sky-600 text-gray-300 hover:text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-sky-500/20">
                                <Icon name="bar-chart-2" className="h-4 w-4" /> Analyze
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
};

export default MarketPage;
