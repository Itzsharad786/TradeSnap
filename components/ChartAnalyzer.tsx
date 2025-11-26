import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../components';

export interface AnalysisData {
    entry: string;
    stopLoss: string;
    takeProfit1: string;
    takeProfit2: string;
    riskScore: number;
    warnings: string[];
    scenarios: {
        name: string;
        probability: string;
        description: string;
    }[];
}

interface ChartAnalyzerProps {
    data: AnalysisData;
    isLoading?: boolean;
}

export const ChartAnalyzer: React.FC<ChartAnalyzerProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                <p className="text-sky-400 animate-pulse">AI Analyzing Chart Structure...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6 w-full max-w-4xl mx-auto">
            {/* Main Signals Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0f172a] p-4 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Entry Price</div>
                    <div className="text-2xl font-black text-blue-400">{data.entry}</div>
                </div>
                <div className="bg-[#0f172a] p-4 rounded-xl border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Stop Loss</div>
                    <div className="text-2xl font-black text-red-400">{data.stopLoss}</div>
                </div>
                <div className="bg-[#0f172a] p-4 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Take Profit 1</div>
                    <div className="text-2xl font-black text-emerald-400">{data.takeProfit1}</div>
                </div>
                <div className="bg-[#0f172a] p-4 rounded-xl border border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Take Profit 2</div>
                    <div className="text-2xl font-black text-emerald-300">{data.takeProfit2}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Assessment */}
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Icon name="shield" className="text-amber-500" /> Risk Assessment
                    </h3>

                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-gray-400 text-sm">Risk Score</span>
                            <span className={`text-xl font-bold ${data.riskScore > 7 ? 'text-red-500' : data.riskScore > 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {data.riskScore}/10
                            </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.riskScore * 10}%` }}
                                className={`h-full ${data.riskScore > 7 ? 'bg-red-500' : data.riskScore > 4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {data.warnings.map((warning, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                                <Icon name="alert-triangle" className="text-amber-500 shrink-0 mt-0.5" />
                                <span>{warning}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scenarios */}
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Icon name="trending-up" className="text-sky-500" /> Forecast Scenarios
                    </h3>

                    <div className="space-y-4">
                        {data.scenarios.map((scenario, i) => (
                            <div key={i} className="relative pl-4 border-l-2 border-gray-700 hover:border-sky-500 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold ${i === 0 ? 'text-sky-400' : 'text-gray-300'}`}>
                                        {scenario.name}
                                    </span>
                                    <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-400">
                                        {scenario.probability}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {scenario.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
