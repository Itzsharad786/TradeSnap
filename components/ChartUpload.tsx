import React, { useRef } from 'react';
import { Icon } from '../components';

interface ChartUploadProps {
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedImage: string | null;
    loading: boolean;
    onAnalyze: () => void;
}

export const ChartUpload: React.FC<ChartUploadProps> = ({ onUpload, selectedImage, loading, onAnalyze }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-[#0f172a] p-6 rounded-3xl border border-gray-800 shadow-2xl mb-8 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onUpload}
                    className="hidden"
                    accept="image/*"
                />

                {!selectedImage ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-64 border-2 border-dashed border-gray-700 hover:border-sky-500 hover:bg-sky-500/5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group/upload"
                    >
                        <div className="p-4 bg-gray-800 rounded-full mb-4 group-hover/upload:scale-110 transition-transform shadow-lg shadow-black/50">
                            <Icon name="upload" className="h-8 w-8 text-sky-400" />
                        </div>
                        <p className="text-gray-300 font-bold text-lg mb-1">Click to Upload Chart</p>
                        <p className="text-gray-500 text-sm">Supports JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                ) : (
                    <div className="w-full space-y-6">
                        {/* Upload Preview */}
                        <div className="relative w-full rounded-2xl overflow-hidden border border-gray-700 shadow-2xl group/preview">
                            <img src={selectedImage} alt="Chart Preview" className="w-full max-h-[400px] object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                                >
                                    Change Image
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={onAnalyze}
                            disabled={loading}
                            className="w-full py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analyzing Chart with AI...
                                </>
                            ) : (
                                <>
                                    <Icon name="spark" className="h-5 w-5" />
                                    Run Deep Analysis
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
