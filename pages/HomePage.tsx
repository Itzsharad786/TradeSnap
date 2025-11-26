import React from 'react';
import type { UserProfile, Page } from '../types';

// STEP 3: Homepage with logo removed and static gradient
export const HomePage: React.FC<{ userProfile: UserProfile | null, setPage: (page: Page) => void }> = ({ userProfile, setPage }) => (
    <div className="relative min-h-screen overflow-hidden">
        {/* Static Dark Gradient Background - No animations */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#1e293b] to-[#0f172a]" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
            {/* NO LOGO - Only title (logo is in navbar) */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-6">
                TRADESNAP
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-10 font-light leading-relaxed">
                Master the markets with AI-powered simulation. <br />
                <span className="text-sky-400 font-medium">Zero Risk. Maximum Reward.</span>
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
                <button onClick={() => setPage('Community')} className="px-8 py-4 bg-sky-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-sky-500 transition-all">
                    Join Community
                </button>
                <button onClick={() => setPage('Market')} className="px-8 py-4 bg-gray-800 text-white font-bold text-lg rounded-full hover:bg-gray-700 transition-all">
                    View Market
                </button>
            </div>
        </div>
    </div>
);

export default HomePage;
