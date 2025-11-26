import React, { useState, useRef } from 'react';
import { PageWrapper } from './PageWrapper';
import { Button, Icon } from '../components';
import { ChartAnalyzer, AnalysisData } from '../components/ChartAnalyzer';
import * as AiService from '../services/geminiService';

export const AnalyzerPage: React.FC = () => {
    const [input, setInput] = useState('');
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [rawResult, setRawResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setAnalysisData(null);
                setRawResult('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!input && !selectedImage) return;

        setLoading(true);
        setAnalysisData(null);
        setRawResult('');

        try {
            let res: string;
            if (selectedImage) {
                // Remove data:image/jpeg;base64, prefix
                const base64 = selectedImage.split(',')[1];
                res = await AiService.analyzeChart(base64, 'image/jpeg', '1H');
            } else {
                res = await AiService.analyzeStock(input);
            }

            try {
                const parsed = JSON.parse(res);
                setAnalysisData(parsed);
            } catch (e) {
                // If parsing fails, it might be a plain text error message
                setRawResult(res);
            }
        } catch (e) {
            setRawResult("AI temporarily disabled. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
                        AI Chart <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">Analyzer</span>
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Upload a chart or enter a symbol to get institutional-grade technical analysis.
                    </p>
                </div>

                <div className="bg-[#0f172a] p-8 rounded-3xl border border-gray-800 shadow-2xl mb-12">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-grow w-full space-y-4">
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Symbol or Asset
                            </label>
                            <div className="relative">
                                <Icon name="search" className="absolute left-4 top-3.5 text-gray-500 h-5 w-5" />
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="e.g. BTC/USD, AAPL, GOLD"
                                    className="w-full bg-[#0a0e1a] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                                    disabled={!!selectedImage}
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex flex-col space-y-4">
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Chart Image
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="secondary"
                                className={`w-full md:w-48 h-[50px] ${selectedImage ? 'border-sky-500 text-sky-400' : ''}`}
                            >
                                <Icon name={selectedImage ? "check" : "upload"} className="mr-2" />
                                {selectedImage ? "Image Selected" : "Upload Chart"}
                            </Button>
                        </div>
                    </div>

                    {selectedImage && (
                        <div className="mt-6 relative rounded-xl overflow-hidden border border-gray-700 bg-black/50 max-h-[300px] flex items-center justify-center group">
                            <img src={selectedImage} alt="Analysis Target" className="max-w-full max-h-[300px] object-contain" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Icon name="x" className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div className="mt-8">
                        <Button
                            onClick={handleAnalyze}
                            disabled={loading || (!input && !selectedImage)}
                            className="w-full py-4 text-lg font-bold shadow-lg shadow-sky-500/20"
                        >
                            {loading ? 'Analyzing Market Structure...' : 'Generate AI Analysis'}
                        </Button>
                    </div>
                </div>

                {/* Results Section */}
                {(analysisData || rawResult) && (
                    <div className="animate-fade-in-up">
                        {analysisData ? (
                            <ChartAnalyzer data={analysisData} isLoading={loading} />
                        ) : (
                            <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 text-center">
                                <Icon name="alert-triangle" className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Analysis Unavailable</h3>
                                <p className="text-gray-400">{rawResult}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
};

export default AnalyzerPage;
