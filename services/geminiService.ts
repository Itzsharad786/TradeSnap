
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
    // Placeholder - AI SDK removed to prevent browser API key requirement
    return `Analysis for ${symbol}:\n\n${PLACEHOLDER_RESPONSE}`;
};

export const analyzeChart = async (imageBase64: string, mimeType: string, timeframe: string): Promise<string> => {
    // Placeholder - AI SDK removed to prevent browser API key requirement
    return `Chart Analysis (${timeframe}):\n\n${PLACEHOLDER_RESPONSE}`;
};

// --- TraderLab ---
export const explainConcept = async (concept: string): Promise<string> => {
    // Placeholder - AI SDK removed to prevent browser API key requirement
    return `Concept: ${concept}\n\n${PLACEHOLDER_RESPONSE}`;
};

