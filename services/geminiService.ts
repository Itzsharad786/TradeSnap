
import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from '../types';

// Get API key from environment - works in both dev and production
const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY) as string;
const ai = new GoogleGenAI({ apiKey });

const TEXT_MODEL = 'gemini-2.5-flash';
const VISION_MODEL = 'gemini-2.5-flash';

const CLEAN_FORMAT_INSTRUCTION = `
IMPORTANT:
- Output PLAIN TEXT only.
- NO Markdown characters (no *, no #, no bold).
- Max 6 lines total.
- STRICT FORMAT:
Trend: 🟩/🟥 [UP/DOWN/SIDEWAYS]
Key Levels: [Support] / [Resistance]
Buy Zone: [Range] 🎯
Sell Zone: [Range] 📉
Risk Note: ⚠️ [Short caution]
`;

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
    const contents = history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: contents,
            config: { systemInstruction: systemInstruction }
        });
        return response.text.replace(/\*/g, ''); // Strip stars just in case
    } catch (error) {
        return "Connection error.";
    }
};

// --- Analyzer ---
export const analyzeStock = async (symbol: string): Promise<string> => {
    const prompt = `Analyze Stock/Forex/Crypto: ${symbol}.
    ${CLEAN_FORMAT_INSTRUCTION}
    Language: English.`;

    try {
        const response = await ai.models.generateContent({ model: TEXT_MODEL, contents: prompt });
        return response.text.replace(/\*/g, '');
    } catch (error) {
        return "Analysis failed.";
    }
};

export const analyzeChart = async (imageBase64: string, mimeType: string, timeframe: string): Promise<string> => {
    const prompt = `Analyze this chart. Timeframe: ${timeframe}.
    ${CLEAN_FORMAT_INSTRUCTION}
    Language: English.`;

    try {
        const imagePart = { inlineData: { data: imageBase64, mimeType: mimeType } };
        const response = await ai.models.generateContent({
            model: VISION_MODEL,
            contents: { parts: [imagePart, { text: prompt }] },
        });
        return response.text.replace(/\*/g, '');
    } catch (error) {
        return "Chart analysis error.";
    }
};

// --- TraderLab ---
export const explainConcept = async (concept: string): Promise<string> => {
    const prompt = `Explain trading concept: "${concept}".
    ${CLEAN_FORMAT_INSTRUCTION}
    But adapt the fields slightly to explain the concept clearly.
    Keep the Risk Note.
    Language: English.`;

    try {
        const response = await ai.models.generateContent({ model: TEXT_MODEL, contents: prompt });
        return response.text.replace(/\*/g, '');
    } catch (error) {
        return "Concept data unavailable.";
    }
};
