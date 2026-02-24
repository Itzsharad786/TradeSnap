import React, { useState } from 'react';
import { PageWrapper } from './PageWrapper';
import { Button, Icon, Card } from '../components';
import { ChartAnalyzer } from '../components/ChartAnalyzer';
import { ChartResult } from '../components/ChartResult';
import * as AiService from '../services/geminiService';
import type { StockAnalysisData } from '../types';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export const AnalyzerPage: React.FC = () => {
    const [mode, setMode] = useState<'stock' | 'chart'>('stock');
    const [input, setInput] = useState('');
    const [result, setResult] = useState<StockAnalysisData | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!input) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await AiService.analyzeStock(input);
            setResult(res);
        } catch (e) {
            console.error(e);
            alert("Analysis temporarily unavailable. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                        Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">Analyzer</span>
                    </h2>
                    <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
                        Get institutional-grade analysis for any stock or technical chart pattern instantly.
                    </p>
                </div>

                {/* Mode Selection Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-[#0f172a] p-1 rounded-xl border border-gray-800 flex gap-1">
                        <button
                            onClick={() => { setMode('stock'); setResult(null); }}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'stock'
                                ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon name="trending-up" className="inline-block mr-2 h-4 w-4" />
                            Stock Analyzer
                        </button>
                        <button
                            onClick={() => { setMode('chart'); setResult(null); }}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'chart'
                                ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon name="image" className="inline-block mr-2 h-4 w-4" />
                            Chart Analyzer
                        </button>
                    </div>
                </div>

                {mode === 'chart' ? (
                    <ChartAnalyzer />
                ) : (
                    <>
                        {/* Input Section */}
                        <div className="bg-[#0f172a] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl mb-12">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">
                                    Enter Stock Symbol
                                </label>
                                <div className="relative">
                                    <Icon name="search" className="absolute left-4 top-3.5 text-gray-500 h-5 w-5" />
                                    <input
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                                        placeholder="e.g. AAPL, TSLA, NVDA"
                                        className="w-full bg-[#0a0e1a] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="mt-8">
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={loading || !input}
                                    className="w-full py-4 text-lg font-bold shadow-lg shadow-sky-500/20"
                                >
                                    {loading ? 'Analyzing...' : 'Analyze Stock'}
                                </Button>
                            </div>
                        </div>

                        {/* Stock Analysis Result */}
                        {result && (
                            <div className="animate-fade-in-up space-y-6">

                                {/* Header: Name, Price, Trend */}
                                <div className="bg-[#0f172a] p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div>
                                        <h1 className="text-4xl font-black text-white flex items-center gap-3">
                                            {result.company.ticker}
                                            <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full text-gray-300">{result.company.name}</span>
                                        </h1>
                                        <div className="mt-2 flex items-baseline gap-4">
                                            <span className="text-5xl font-black tracking-tighter text-white">${result.price.current.toFixed(2)}</span>
                                            <span className={`text-lg font-bold flex items-center ${result.price.change >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                                                <Icon name={result.price.change >= 0 ? 'trending-up' : 'trending-down'} className="h-5 w-5 mr-1" />
                                                {result.price.change >= 0 ? '+' : ''}{result.price.change} ({result.price.changePercent}%)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${result.analysis.recommendation === 'Buy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                            result.analysis.recommendation === 'Sell' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            }`}>
                                            <Icon name={result.analysis.recommendation === 'Buy' ? 'check' : result.analysis.recommendation === 'Sell' ? 'close' : 'info'} className="h-5 w-5" />
                                            {result.analysis.recommendation.toUpperCase()}
                                        </div>
                                        <div className="text-sm text-gray-400 font-mono">Confidence: {result.analysis.confidence}%</div>
                                    </div>
                                </div>

                                {/* Top Grid: Overview, Chart, Key Stats */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                    {/* Company Overview */}
                                    <Card className="p-6 col-span-1 border-gray-800 bg-[#0f172a]">
                                        <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2"><Icon name="community" className="text-sky-500" /> Company Profile</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500">Sector</span> <span className="text-white font-medium text-right">{result.company.sector}</span></div>
                                            <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500">Industry</span> <span className="text-white font-medium text-right">{result.company.industry}</span></div>
                                            <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500">CEO</span> <span className="text-white font-medium text-right">{result.company.ceo}</span></div>
                                            <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500">HQ</span> <span className="text-white font-medium text-right">{result.company.headquarters}</span></div>
                                            <div className="flex justify-between pt-1"><span className="text-gray-500">Founded</span> <span className="text-white font-medium text-right">{result.company.founded}</span></div>
                                        </div>
                                        <p className="mt-4 text-xs text-gray-400 leading-relaxed line-clamp-4">{result.company.description}</p>
                                    </Card>

                                    {/* Chart (Sparkline) */}
                                    <Card className="p-6 col-span-1 lg:col-span-2 border-gray-800 bg-[#0f172a] flex flex-col">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2"><Icon name="trending-up" className="text-emerald-500" /> Price Action (Intraday)</h3>
                                            <div className="flex gap-2">
                                                <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded text-gray-400">1D</span>
                                                <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded text-gray-400">1W</span>
                                                <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded text-gray-400">1M</span>
                                            </div>
                                        </div>
                                        <div className="flex-grow min-h-[200px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={result.chartData}>
                                                    <XAxis dataKey="label" hide />
                                                    <YAxis domain={['auto', 'auto']} hide />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                        itemStyle={{ color: '#e2e8f0' }}
                                                        labelStyle={{ display: 'none' }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="price"
                                                        stroke={result.price.change >= 0 ? '#10b981' : '#f43f5e'}
                                                        strokeWidth={3}
                                                        dot={false}
                                                        activeDot={{ r: 6, fill: '#fff' }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </div>

                                {/* Analysis Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                                    {/* 1. Market Stats (Fundamentals) */}
                                    <Card className="p-5 border-gray-800 bg-[#0f172a]">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">📌 Real-Time Stock Overview</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between"><span className="text-gray-400 text-sm">Market Cap</span> <span className="font-bold">{result.price.marketCap}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-400 text-sm">Volume</span> <span className="font-bold">{result.price.volume}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-400 text-sm">Day Range</span> <span className="font-bold text-xs">{result.price.dayHigh} - {result.price.dayLow}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-400 text-sm">52W Range</span> <span className="font-bold text-xs">{result.price.yearLow} - {result.price.yearHigh}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-400 text-sm">PE Ratio</span> <span className="font-bold text-xs">{result.price.peRatio}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-400 text-sm">Earnings</span> <span className="font-bold text-xs">{result.price.nextEarningsDate}</span></div>
                                        </div>
                                    </Card>

                                    {/* 2. Technical Analysis (Trend + Levels) */}
                                    <Card className="p-5 border-gray-800 bg-[#0f172a]">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">📈 Technical Analysis</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg mb-2">
                                                <span className="text-sm text-gray-400">Trend</span>
                                                <span className={`font-bold text-sm flex items-center gap-1 ${result.analysis.trend === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    <Icon name={result.analysis.trend === 'Bullish' ? 'trending-up' : 'trending-down'} className="h-4 w-4" />
                                                    {result.analysis.trend}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="text-[10px] text-rose-400 font-bold uppercase">Resistance</div>
                                                <div className="flex gap-1 flex-wrap">
                                                    {result.keyLevels.resistance.map((l, i) => (
                                                        <span key={i} className="bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded text-[10px] border border-rose-500/20 font-mono">${l}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-emerald-400 font-bold uppercase">Support</div>
                                                <div className="flex gap-1 flex-wrap">
                                                    {result.keyLevels.support.map((l, i) => (
                                                        <span key={i} className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] border border-emerald-500/20 font-mono">${l}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* 3. AI Forecast (Probabilites) */}
                                    <Card className="p-5 border-gray-800 bg-[#0f172a]">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">🔮 Forecast</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-emerald-400">Bullish Prob.</span>
                                                    <span className="text-white font-bold">{result.forecast.probBullish}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${result.forecast.probBullish}%` }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-rose-400">Bearish Prob.</span>
                                                    <span className="text-white font-bold">{result.forecast.probBearish}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-rose-500" style={{ width: `${result.forecast.probBearish}%` }} />
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-800 space-y-3">
                                                <div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Short (1-4W)</div>
                                                    <div className="text-xs text-sky-300 leading-tight">{result.futureOutlook.shortTerm}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Mid (3-6M)</div>
                                                    <div className="text-xs text-gray-400 leading-tight">{result.futureOutlook.midTerm}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Long (1Y+)</div>
                                                    <div className="text-xs text-gray-500 leading-tight">{result.futureOutlook.longTerm}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* 4. AI Price Targets */}
                                    <Card className="p-5 border-gray-800 bg-[#0f172a]">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">💰 Price Targets</h4>
                                        <div className="space-y-3 relative">
                                            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gray-700 ml-1.5"></div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 z-10 border-2 border-[#0f172a]"></div>
                                                <div className="flex-grow flex justify-between"><span className="text-gray-400 text-sm">1 Week</span> <span className="font-bold text-emerald-400 font-mono">${result.analysis.targetPrice1W}</span></div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-emerald-600 z-10 border-2 border-[#0f172a]"></div>
                                                <div className="flex-grow flex justify-between"><span className="text-gray-400 text-sm">1 Month</span> <span className="font-bold text-emerald-500 font-mono">${result.analysis.targetPrice1M}</span></div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-emerald-700 z-10 border-2 border-[#0f172a]"></div>
                                                <div className="flex-grow flex justify-between"><span className="text-gray-400 text-sm">1 Year</span> <span className="font-bold text-emerald-600 font-mono">${result.analysis.targetPrice1Y}</span></div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Fundamentals & Risk Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="p-5 border-gray-800 bg-[#0f172a]">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">📊 Fundamental Overview</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between"><span className="text-gray-400">Valuation</span> <span className={`font-bold ${result.fundamentals.valuation === 'Undervalued' ? 'text-emerald-400' : result.fundamentals.valuation === 'Overvalued' ? 'text-rose-400' : 'text-amber-400'}`}>{result.fundamentals.valuation}</span></div>
                                            <p className="text-xs text-gray-500">{result.fundamentals.valuationReason}</p>
                                            <div className="pt-2 border-t border-gray-800">
                                                <div className="text-gray-400 mb-1 text-xs uppercase font-bold">Revenue Trend</div>
                                                <div className="font-medium text-white">{result.fundamentals.revenueTrend}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-400 mb-1 text-xs uppercase font-bold">Profitability</div>
                                                <div className="font-medium text-white">{result.fundamentals.profitability}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-400 mb-1 text-xs uppercase font-bold">Debt Status</div>
                                                <div className="font-medium text-white">{result.fundamentals.debtStatus}</div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-5 border-gray-800 bg-[#0f172a]">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">⚠️ Risk Analysis</h4>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`text-3xl font-black ${result.riskAnalysis.riskScore >= 7 ? 'text-rose-500' : result.riskAnalysis.riskScore >= 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                {result.riskAnalysis.riskScore}<span className="text-base text-gray-600">/10</span>
                                            </div>
                                            <div className="text-sm text-gray-400 leading-tight">Composite<br />Risk Score</div>
                                        </div>
                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <div className="text-gray-400 mb-1 text-xs uppercase font-bold">Market Risk</div>
                                                <div className="font-medium text-rose-200">{result.riskAnalysis.marketRisk}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-400 mb-1 text-xs uppercase font-bold">News Risk</div>
                                                <div className="font-medium text-amber-200">{result.riskAnalysis.newsRisk}</div>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-800 pt-3">
                                                <span className="text-gray-400">Volatility</span>
                                                <span className={`font-bold ${result.riskAnalysis.volatility === 'High' ? 'text-rose-400' : 'text-emerald-400'}`}>{result.riskAnalysis.volatility}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Explanation & News */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card className="p-6 border-gray-800 bg-[#0f172a]">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Icon name="spark" className="text-amber-400" /> Analyst's Verdict</h3>
                                        <p className="text-gray-300 leading-relaxed text-sm md:text-base font-light">
                                            {result.explanation}
                                        </p>
                                    </Card>

                                    <Card className="p-6 border-gray-800 bg-[#0f172a]">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Icon name="news" className="text-purple-400" /> Latest Insights</h3>
                                        <div className="space-y-4">
                                            {result.news.map((n, i) => (
                                                <div key={i} className="group cursor-pointer hover:bg-white/5 p-3 rounded-xl transition-colors">
                                                    <h4 className="font-bold text-sky-400 text-sm group-hover:underline mb-1">{n.headline}</h4>
                                                    <p className="text-xs text-gray-400 line-clamp-2">{n.summary}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>

                                {/* Trade Setup Breakdown */}
                                <div className="mt-8 border-t border-gray-800 pt-8">
                                    <h2 className="text-2xl font-black text-white mb-6 text-center">Trade Setup</h2>
                                    <ChartResult data={result.tradeSetup} />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PageWrapper>
    );
};

export default AnalyzerPage;
