import React, { useState, useRef } from 'react';
import { PageWrapper } from './PageWrapper';
import { Button, Icon } from '../components';
import * as AiService from '../services/geminiService';

export const AnalyzerPage: React.FC = () => {
    const [mode, setMode] = useState<'stock' | 'chart'>('stock');
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setResult('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (mode === 'stock' && !input) return;
        if (mode === 'chart' && !selectedImage) return;

        setLoading(true);
        setResult('');

        try {
            let res: string;
            if (mode === 'chart' && selectedImage) {
                const base64 = selectedImage.split(',')[1];
                res = await AiService.analyzeChart(base64, 'image/jpeg', '1H');
            } else {
                res = await AiService.analyzeStock(input);
            }
            setResult(res);
        } catch (e) {
            setResult("AI temporarily disabled. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                        AI Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">Analyzer</span>
                    </h2>
                    <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
                        Get institutional-grade analysis for any stock or technical chart pattern instantly.
                    </p>
                </div>

                {/* Mode Selection Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-[#0f172a] p-1 rounded-xl border border-gray-800 flex gap-1">
                        <button
                            onClick={() => { setMode('stock'); setResult(''); }}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'stock'
                                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon name="trending-up" className="inline-block mr-2 h-4 w-4" />
                            Stock Analyzer
                        </button>
                        <button
                            onClick={() => { setMode('chart'); setResult(''); }}
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

                <div className="bg-[#0f172a] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl mb-12">
                    {mode === 'stock' ? (
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Enter Stock Symbol
                            </label>
                            <div className="relative">
                                <Icon name="search" className="absolute left-4 top-3.5 text-gray-500 h-5 w-5" />
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="e.g. AAPL, TSLA, NVDA"
                                    className="w-full bg-[#0a0e1a] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Upload Chart Image
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${selectedImage
                                        ? 'border-sky-500 bg-sky-500/10'
                                        : 'border-gray-700 hover:border-sky-500 hover:bg-gray-800'
                                    }`}
                            >
                                {selectedImage ? (
                                    <div className="relative inline-block">
                                        <img src={selectedImage} alt="Preview" className="max-h-48 rounded-lg shadow-lg" />
                                        <div className="mt-2 text-sky-400 font-medium text-sm">Click to change image</div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Icon name="upload" className="h-10 w-10 text-gray-500 mx-auto" />
                                        <p className="text-gray-400 font-medium">Click to upload trading chart</p>
                                        <p className="text-gray-600 text-xs">Supports JPG, PNG, WEBP</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <Button
                            onClick={handleAnalyze}
                            disabled={loading || (mode === 'stock' && !input) || (mode === 'chart' && !selectedImage)}
                            className="w-full py-4 text-lg font-bold shadow-lg shadow-sky-500/20"
                        >
                            {loading ? 'Analyzing...' : `Analyze ${mode === 'stock' ? 'Stock' : 'Chart'}`}
                        </Button>
                    </div>
                </div>

                {/* Results Section */}
                {result && (
                    <div className="animate-fade-in-up bg-[#0f172a] p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                            <div className="p-2 bg-sky-500/10 rounded-lg">
                                <Icon name="cpu" className="h-6 w-6 text-sky-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">AI Analysis Result</h3>
                        </div>
                        <div className="prose prose-invert prose-lg max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed bg-transparent border-none p-0">
                                {result}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
};

export default AnalyzerPage;
