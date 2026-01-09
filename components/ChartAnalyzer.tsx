import React, { useState } from 'react';
import { ChartUpload } from './ChartUpload';
import { ChartResult } from './ChartResult';
import { PageWrapper } from '../pages/PageWrapper';
import * as AiService from '../services/geminiService';
import type { ChartAnalysisData } from '../types';

export const ChartAnalyzer: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<ChartAnalysisData | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setAnalysisResult(null); // Reset result on new upload
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) return;

        setLoading(true);
        try {
            const result = await AiService.analyzeChart(selectedImage, 'image/png', '1H');
            setAnalysisResult(result);
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <ChartUpload
                onUpload={handleImageUpload}
                selectedImage={selectedImage}
                loading={loading}
                onAnalyze={handleAnalyze}
            />

            {analysisResult && (
                <div id="results-section">
                    <ChartResult data={analysisResult} />
                </div>
            )}
        </div>
    );
};
