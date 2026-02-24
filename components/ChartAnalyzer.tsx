import React, { useState } from 'react';
import { ChartUpload } from './ChartUpload';
import { ChartResult } from './ChartResult';
import * as AiService from '../services/geminiService';
import type { ChartAnalysisData } from '../types';

type ErrorType = 'not_a_chart' | 'blur' | 'generic' | null;

interface ChartError {
    message: string;
    type: ErrorType;
}

export const ChartAnalyzer: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<ChartAnalysisData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ChartError | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setAnalysisResult(null);
                setError(null); // Reset error on new upload
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) return;
        setLoading(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const result = await AiService.analyzeChart(selectedImage, 'image/png', '1H');
            setAnalysisResult(result);
        } catch (e: any) {
            const msg: string = e.message || '';
            let type: ErrorType = 'generic';
            if (msg.toLowerCase().includes('not a trading chart') || msg.toLowerCase().includes('not_a_chart')) {
                type = 'not_a_chart';
            } else if (msg.toLowerCase().includes('not clear') || msg.toLowerCase().includes('blur')) {
                type = 'blur';
            }
            setError({ message: msg, type });
        } finally {
            setLoading(false);
        }
    };

    const getErrorUI = () => {
        if (!error) return null;

        if (error.type === 'not_a_chart') {
            return (
                <div className="mt-6 p-6 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-start gap-4">
                    <div className="text-3xl">🚫</div>
                    <div>
                        <h3 className="text-red-400 font-bold text-lg mb-1">Not a Trading Chart</h3>
                        <p className="text-gray-300 text-sm">
                            The image you uploaded is <span className="text-red-400 font-semibold">not a financial trading chart</span>.
                            Please upload a candlestick, line, or bar chart from platforms like TradingView, Zerodha, MT4, etc.
                        </p>
                        <button
                            onClick={() => { setSelectedImage(null); setError(null); }}
                            className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-xl text-sm font-semibold transition-all"
                        >
                            📁 Upload a Trading Chart
                        </button>
                    </div>
                </div>
            );
        }

        if (error.type === 'blur') {
            return (
                <div className="mt-6 p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-4">
                    <div className="text-3xl">🔍</div>
                    <div>
                        <h3 className="text-amber-400 font-bold text-lg mb-1">Chart Not Clear Enough</h3>
                        <p className="text-gray-300 text-sm">
                            The chart is <span className="text-amber-400 font-semibold">too blurry or unclear</span> to analyze accurately.
                            Please upload a higher quality or zoomed-in screenshot where the candles and price levels are clearly visible.
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                            💡 Tip: Take a screenshot directly from TradingView or zoom in before capturing.
                        </p>
                        <button
                            onClick={() => { setSelectedImage(null); setError(null); }}
                            className="mt-3 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-sm font-semibold transition-all"
                        >
                            📸 Upload a Clearer Chart
                        </button>
                    </div>
                </div>
            );
        }

        // Generic error
        return (
            <div className="mt-6 p-6 rounded-2xl border border-gray-700 bg-gray-800/50 flex items-start gap-4">
                <div className="text-3xl">⚠️</div>
                <div>
                    <h3 className="text-gray-300 font-bold text-lg mb-1">Analysis Failed</h3>
                    <p className="text-gray-400 text-sm">{error.message || 'Something went wrong. Please try again.'}</p>
                    <button
                        onClick={() => { setError(null); }}
                        className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-semibold transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <ChartUpload
                onUpload={handleImageUpload}
                selectedImage={selectedImage}
                loading={loading}
                onAnalyze={handleAnalyze}
            />

            {getErrorUI()}

            {analysisResult && !error && (
                <div id="results-section">
                    <ChartResult data={analysisResult} />
                </div>
            )}
        </div>
    );
};
