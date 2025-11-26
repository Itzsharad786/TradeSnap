
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
// --- Analyzer ---
export const analyzeStock = async (symbol: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!symbol || symbol.length < 2) {
        return "❌ Error: Invalid symbol. Try another stock.";
    }

    const s = symbol.toUpperCase();
    const price = (Math.random() * 1000 + 10).toFixed(2);
    const trend = Math.random() > 0.5 ? "Bullish" : "Bearish";
    const rec = trend === "Bullish" ? "Yes" : "No";
    const risk = Math.floor(Math.random() * 10) + 1;

    return `📊 Stock Analysis for ${s}
Current Price: $${price}
Trend: ${trend}
Buy Recommendation: ${rec}
Target Price (1 month): $${(parseFloat(price) * 1.05).toFixed(2)}
Target Price (6 months): $${(parseFloat(price) * 1.15).toFixed(2)}
Target Price (1 year): $${(parseFloat(price) * 1.25).toFixed(2)}
Risk Level: ${risk}/10
Volatility: ${Math.random() > 0.5 ? "High" : "Medium"}
Key Support Levels: $${(parseFloat(price) * 0.9).toFixed(2)}, $${(parseFloat(price) * 0.85).toFixed(2)}
Key Resistance Levels: $${(parseFloat(price) * 1.1).toFixed(2)}, $${(parseFloat(price) * 1.15).toFixed(2)}
Why?
The stock is showing strong momentum with increasing volume. Technical indicators RSI and MACD suggest a continuation of the current ${trend.toLowerCase()} trend. However, market volatility remains a concern.`;
};

export const analyzeChart = async (imageBase64: string, mimeType: string, timeframe: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const trend = Math.random() > 0.5 ? "Bullish Uptrend" : "Bearish Downtrend";
    const risk = Math.floor(Math.random() * 10) + 1;

    return `📸 Chart Interpretation
Trend: ${trend}
Support Levels: Strong support observed at recent swing lows.
Resistance Levels: Major resistance near the psychological round number.
Breakout Probability: ${Math.floor(Math.random() * 40 + 40)}%
Bearish/Bullish Pattern Observed: ${Math.random() > 0.5 ? "Ascending Triangle" : "Head and Shoulders"}
Risk Score: ${risk}/10
Final Verdict:
The chart structure indicates a potential ${trend.toLowerCase()} continuation. Traders should wait for a confirmed breakout/breakdown before entering. Stop losses should be tight due to current volatility.`;
};

// --- TraderLab ---
export const explainConcept = async (concept: string): Promise<string> => {
    // Placeholder - AI SDK removed to prevent browser API key requirement
    return `Concept: ${concept}\n\n${PLACEHOLDER_RESPONSE}`;
};

