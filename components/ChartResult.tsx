import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../components';
import type { ChartAnalysisData } from '../types';

export const ChartResult: React.FC<{ data: ChartAnalysisData }> = ({ data }) => {
    return (
        <div className="space-y-6 animate-fade-in-up">

            {/* Header Status Bar */}
            <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between items-center bg-[#0f172a] p-4 rounded-2xl border border-gray-800">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${data.trend === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        <Icon name={data.trend === 'Bullish' ? 'trending-up' : 'trending-down'} className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Market Trend</div>
                        <div className={`font-black text-lg ${data.trend === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>{data.trend}</div>
                    </div>
                </div>

                <div className="h-8 w-[1px] bg-gray-700 hidden md:block" />

                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                        <Icon name="chart" className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pattern</div>
                        <div className="font-bold text-lg text-white">{data.pattern || "Wait for confirmation"}</div>
                    </div>
                </div>

                <div className="h-8 w-[1px] bg-gray-700 hidden md:block" />

                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                        <Icon name="cpu" className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Momentum</div>
                        <div className="font-bold text-lg text-purple-400">{data.momentum}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. ENTRY & EXIT LEVELS (Instagram Style Cards) */}
                <div className="bg-[#0f172a] p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
                    {/* Neon blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2 relative z-10">
                        <span className="text-sky-400">01.</span> Trade Plan
                    </h3>

                    <div className="space-y-4 relative z-10">
                        {/* Entry */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center shadow-lg">
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Entry Price</div>
                                <div className="text-2xl font-black text-white tracking-tight">${data.entry.toLocaleString()}</div>
                            </div>
                            <div className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400">
                                <Icon name="trend" className="h-5 w-5" />
                            </div>
                        </div>

                        {/* Stop Loss */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800/50 p-4 rounded-xl border border-rose-900/30 flex justify-between items-center shadow-lg relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                            <div>
                                <div className="text-xs text-rose-400/80 font-bold uppercase mb-1">Stop Loss</div>
                                <div className="text-2xl font-black text-white tracking-tight">${data.stopLoss.toLocaleString()}</div>
                            </div>
                            <div className="text-rose-500">
                                <Icon name="close" className="h-6 w-6" />
                            </div>
                        </div>

                        {/* Take Profits */}
                        <div className="space-y-2">
                            <div className="bg-gradient-to-r from-emerald-900/10 to-emerald-900/5 p-4 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                                <div><div className="text-xs text-emerald-500/80 font-bold uppercase mb-1">Take Profit 1</div><div className="text-xl font-bold text-white">${data.tp1.toLocaleString()}</div></div>
                                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">Safe</div>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-900/10 to-emerald-900/5 p-4 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                                <div><div className="text-xs text-emerald-500/80 font-bold uppercase mb-1">Take Profit 2</div><div className="text-xl font-bold text-white">${data.tp2.toLocaleString()}</div></div>
                                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">Normal</div>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-900/10 to-emerald-900/5 p-4 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                                <div><div className="text-xs text-emerald-500/80 font-bold uppercase mb-1">Take Profit 3</div><div className="text-xl font-bold text-white">${data.tp3.toLocaleString()}</div></div>
                                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">Moon</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. RISK & SCENARIOS */}
                <div className="space-y-6">

                    {/* Risk Assessment */}
                    <div className="bg-[#1a120b] p-6 rounded-3xl border border-amber-900/30 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                <span className="text-amber-500">02.</span> Risk Assessment
                            </h3>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-amber-500/80 font-bold uppercase">Risk Score</span>
                                <span className={`text-4xl font-black ${data.riskScore > 7 ? 'text-red-500' : data.riskScore > 4 ? 'text-amber-500' : 'text-emerald-500'}`}>{data.riskScore}/10</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {data.warnings.map((w, i) => (
                                <div key={i} className="flex gap-3 items-start text-amber-200/80 text-sm bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                                    <Icon name="info" className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                    {w}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scenario Forecasts */}
                    <div className="bg-[#0f172a] p-6 rounded-3xl border border-gray-800 shadow-xl">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                            <span className="text-purple-400">03.</span> AI Scenarios
                        </h3>

                        <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sky-400 text-sm">Most Likely</span>
                                    <span className="bg-sky-500/20 text-sky-400 text-[10px] font-black uppercase px-2 py-1 rounded">70% PROB</span>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed">{data.scenarios.mostLikely}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/10">
                                    <div className="font-bold text-emerald-400 text-xs mb-2 uppercase">Bullish Case</div>
                                    <p className="text-xs text-gray-400 leading-relaxed">{data.scenarios.bullish}</p>
                                </div>
                                <div className="bg-rose-900/10 p-4 rounded-xl border border-rose-500/10">
                                    <div className="font-bold text-rose-400 text-xs mb-2 uppercase">Bearish Case</div>
                                    <p className="text-xs text-gray-400 leading-relaxed">{data.scenarios.bearish}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* 4. TECHNICAL BREAKDOWN (Horizontal Scroll on Mobile, Grid on Desktop) */}
            <div className="bg-[#0f172a] p-6 rounded-3xl border border-gray-800 shadow-xl">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <span className="text-gray-500">04.</span> Key Levels
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-xs font-bold text-rose-400 uppercase mb-3 flex items-center gap-2"><Icon name="trend" className="rotate-180" /> Resistances</h4>
                        <div className="space-y-2">
                            {data.resistances.map((l, i) => (
                                <div key={i} className="flex justify-between p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                                    <span className="text-gray-400 text-sm">R{i + 1}</span>
                                    <span className="font-mono font-bold text-white">${l}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-emerald-400 uppercase mb-3 flex items-center gap-2"><Icon name="trend" /> Supports</h4>
                        <div className="space-y-2">
                            {data.supports.map((l, i) => (
                                <div key={i} className="flex justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                    <span className="text-gray-400 text-sm">S{i + 1}</span>
                                    <span className="font-mono font-bold text-white">${l}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Technical Deep Dive */}
            <div className="bg-[#0f172a] p-6 rounded-3xl border border-gray-800 shadow-xl">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <span className="text-sky-400">05.</span> Technical Deep Dive
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Indicators & Setup</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex justify-between border-b border-gray-800 pb-2"><span>RSI</span> <span className="font-bold text-white">{data.indicators?.rsi || 'N/A'}</span></div>
                            <div className="flex justify-between border-b border-gray-800 pb-2"><span>MACD</span> <span className="font-bold text-white">{data.indicators?.macd || 'N/A'}</span></div>
                            <div className="flex justify-between"><span>Moving Avgs</span> <span className="font-bold text-white">{data.indicators?.ma || 'N/A'}</span></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Pattern & Market Structure</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex justify-between border-b border-gray-800 pb-2"><span>Structure</span> <span className="font-bold text-white">{data.trendAnalysis?.marketStructure || 'N/A'}</span></div>
                            <div className="flex justify-between border-b border-gray-800 pb-2"><span>Pattern Status</span> <span className={`font-bold ${data.patternDetection?.status === 'Breakout' ? 'text-emerald-400' : 'text-amber-400'}`}>{data.patternDetection?.status || 'N/A'}</span></div>
                            <div className="text-xs text-gray-500 mt-2 italic">"{data.trendAnalysis?.confirmation || 'No confirmation detected'}"</div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-800">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 text-center">Institutional Verdict Logic</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                            <span className="text-emerald-500 font-bold text-xs uppercase block mb-1">Why Enter?</span>
                            <p className="text-sm text-gray-300 leading-relaxed">{data.verdict?.entryLogic || 'N/A'}</p>
                        </div>
                        <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                            <span className="text-rose-500 font-bold text-xs uppercase block mb-1">Stop Loss Logic</span>
                            <p className="text-sm text-gray-300 leading-relaxed">{data.verdict?.stopLossLogic || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
