
// AI Service - Placeholder Implementation
// Note: Direct AI SDK usage removed to prevent browser API key exposure
// TODO: Move to Netlify Functions for production AI features

import type { ChatMessage } from '../types';

// Placeholder responses for development/fallback
const PLACEHOLDER_RESPONSE = "AI features temporarily disabled in production.\nPlease check back later for full AI analysis.";

// --- Chatbot ---
let systemInstruction = "";
let initialBotMessage = "Hello. Ready to trade?";

export const startChat = () => {
    systemInstruction = `You are a professional trading assistant.
    RULES:
    1. NO markdown, NO bold, NO stars. Plain text only.
    2. Keep answers under 6 lines.
    3. Use emojis: 🟩 🟥 ⚠️ 📉 📈
    4. Tone: Professional, concise, Bloomberg style.
    5. Language: English.`;

    initialBotMessage = "System Online. Markets are active.";
};

export const getInitialBotMessage = () => initialBotMessage;

export const sendMessageToBot = async (history: ChatMessage[]): Promise<string> => {
    // Placeholder - AI SDK removed to prevent browser API key requirement
    return PLACEHOLDER_RESPONSE;
};

// --- Analyzer ---
export const analyzeStock = async (symbol: string): Promise<string> => {
    // Mock structured response for UI demo
    const mockData = {
        entry: (Math.random() * 100 + 100).toFixed(2),
        stopLoss: (Math.random() * 100 + 90).toFixed(2),
        takeProfit1: (Math.random() * 100 + 110).toFixed(2),
        takeProfit2: (Math.random() * 100 + 120).toFixed(2),
        riskScore: Math.floor(Math.random() * 10) + 1,
        warnings: [
            "High volatility expected in upcoming session",
            `Key resistance level at ${(Math.random() * 100 + 115).toFixed(2)}`,
            "RSI indicates potential overbought condition"
        ],
        scenarios: [
            { name: "Bullish Continuation", probability: "60%", description: "Price breaks above resistance and targets higher levels." },
            { name: "Consolidation", probability: "30%", description: "Price ranges between support and resistance levels." },
            { name: "Bearish Reversal", probability: "10%", description: "Price fails to hold support and drops." }
        ]
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return JSON.stringify(mockData);
};

export const analyzeChart = async (imageBase64: string, mimeType: string, timeframe: string): Promise<string> => {
    // Mock structured response for UI demo
    const mockData = {
        entry: "1.0850",
        stopLoss: "1.0820",
        takeProfit1: "1.0890",
        takeProfit2: "1.0920",
        riskScore: 4,
        warnings: [
            "Wait for candle close to confirm breakout",
            "News event in 2 hours may impact volatility",
            "Volume is lower than average"
        ],
        scenarios: [
            { name: "Trend Continuation", probability: "70%", description: "Price respects the trendline and moves higher." },
            { name: "False Breakout", probability: "20%", description: "Price spikes up but closes back inside the range." },
            { name: "Reversal", probability: "10%", description: "Strong rejection at resistance leads to a sell-off." }
        ]
    };

    await new Promise(resolve => setTimeout(resolve, 2500));

    return JSON.stringify(mockData);
};

// --- TraderLab ---
export const explainConcept = async (concept: string): Promise<string> => {
    // Placeholder - AI SDK removed to prevent browser API key requirement
    return `Concept: ${concept}\n\n${PLACEHOLDER_RESPONSE}`;
};

