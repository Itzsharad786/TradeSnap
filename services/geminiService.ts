
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchStockData, RealTimeStockData } from './stockService';
import type { StockAnalysisData, ChartAnalysisData } from '../types';

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const STOCK_ANALYSIS_PROMPT = `
You are an institutional-grade AI Trading Analyst.

CRITICAL RULES (NO EXCEPTIONS):
1. USE THE PROVIDED REAL-TIME DATA. DO NOT INVENT PRICES.
2. If the data provided is valid, analyze it deeply.
3. NEVER guess prices.
4. Output specific JSON only.

Generate a FULL STOCK DOSSIER in this EXACT JSON STRUCTURE:
{
  "company": { "name": "...", "ticker": "...", "sector": "...", "industry": "...", "ceo": "...", "headquarters": "...", "founded": "...", "description": "...", "exchange": "..." },
  "fundamentals": { "revenueTrend": "...", "profitability": "...", "debtStatus": "...", "valuation": "Overvalued/Fair/Undervalued", "valuationReason": "..." },
  "riskAnalysis": { "marketRisk": "...", "newsRisk": "...", "volatility": "Low/Medium/High", "riskScore": 1-10 },
  "futureOutlook": { "shortTerm": "...", "midTerm": "...", "longTerm": "..." },
  "technicalAnalysis": { "trend": "Bullish/Bearish/Neutral", "rsi": "...", "macd": "...", "keySupport": ["..."], "keyResistance": ["..."] },
  "verdict": { "action": "Buy/Hold/Avoid", "targetAudience": "Trader/Investor", "reasoning": "..." },
  "analysis": { 
      "recommendation": "Buy/Sell/Hold", 
      "confidence": 0-100, 
      "trend": "...", 
      "targetPrice1W": number, 
      "targetPrice1M": number, 
      "targetPrice1Y": number 
  },
  "explanation": "..."
}
`;

export const analyzeStock = async (symbol: string): Promise<StockAnalysisData> => {
    // 1. Fetch Real-Time Data First
    let realData: RealTimeStockData;
    try {
        realData = await fetchStockData(symbol);
    } catch (e: any) {
        throw new Error(e.message || "Real-time market data unavailable. Analysis aborted.");
    }

    // 2. Prepare Prompt with Real Data
    const prompt = `
    ${STOCK_ANALYSIS_PROMPT}

    REAL-TIME MARKET DATA (SOURCE OF TRUTH):
    Symbol: ${realData.symbol}
    Price: ${realData.price} ${realData.currency}
    Change: ${realData.change} (${realData.changePercent}%)
    Market Cap: ${realData.marketCap}
    Volume: ${realData.volume}
    Day Range: ${realData.dayHigh} - ${realData.dayLow}
    Year Range: ${realData.yearHigh} - ${realData.yearLow}
    Top 5 Recent Prices: ${JSON.stringify(realData.history.slice(-5))}

    Analyze this data. Fill in the specific details using your knowledge of the company (${realData.symbol}).
    Strictly follow the JSON structure.
    `;

    try {
        // 3. Call Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Parse JSON (Handle potential markdown code blocks)
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiData = JSON.parse(jsonString);

        // 5. Merge AI Analysis with REAL Data (Trust Real Data for Price)
        return {
            ...aiData,
            price: {
                current: realData.price,
                change: parseFloat(realData.change.toFixed(2)),
                changePercent: parseFloat(realData.changePercent.toFixed(2)),
                currency: realData.currency,
                marketCap: formatCompactNumber(realData.marketCap),
                volume: formatCompactNumber(realData.volume),
                avgVolume: "N/A", // Could calculate from history if full
                dayHigh: realData.dayHigh,
                dayLow: realData.dayLow,
                yearHigh: realData.yearHigh,
                yearLow: realData.yearLow,
                peRatio: realData.peRatio ? realData.peRatio.toFixed(2) : "N/A",
                eps: "N/A", // EPS not explicitly in Basic interface but likely in KeyStatistics if we wanted deep dive
                dividendYield: "N/A", // Could be added similarly
                nextEarningsDate: realData.nextEarningsDate ? new Date(realData.nextEarningsDate * 1000).toLocaleDateString() : "N/A"
            },
            chartData: realData.history.map(h => ({ price: h.price, label: new Date(h.date).toLocaleDateString() })),
            news: [], // Could fetch news separately if needed, passing empty for now to avoid hallucination
            tradeSetup: { // Default legacy structure if AI didn't return it perfectly, or map it
                ...aiData.tradeSetup, // If AI generated it
                entry: realData.price // Ensure entry is close to current
            },
            forecast: {
                probBullish: aiData.analysis.recommendation === 'Buy' ? 70 : 30,
                probBearish: aiData.analysis.recommendation === 'Sell' ? 70 : 30,
                projection1M: aiData.futureOutlook.shortTerm,
                projection1Y: aiData.futureOutlook.longTerm
            }
        } as StockAnalysisData;

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        throw new Error("AI could not analyze the data.");
    }
};

export const analyzeChart = async (imageBase64: string, mimeType: string, timeframe: string): Promise<ChartAnalysisData> => {
    // Validate Image is a Trading Chart
    const validationPrompt = "Is this image a financial trading chart (candlestick, line, bar)? Answer YES or NO.";
    // We can combine validation + analysis to save tokens/latency

    const prompt = `
     You are an expert technical analyst.
     
     STRICT VALIDATION:
     First, check if this image is a financial trading chart.
     If NO (it's a selfie, landscape, random object): Return valid JSON with "error": "Invalid image. Please upload a trading chart only."
     
     If YES:
     Perform a detailed technical analysis.
     Timeframe: ${timeframe}
     
     Output JSON Structure:
     {
        "chartType": { "timeframe": "${timeframe}", "asset": "Stocks/Crypto/Forex" },
        "trendAnalysis": { "marketStructure": "Bullish/Bearish/Range", "confirmation": "..." },
        "keyLevels": { "support": ["..."], "resistance": ["..."] },
        "patternDetection": { "pattern": "...", "status": "Breakout/Developing" },
        "indicators": { "rsi": "...", "macd": "...", "ma": "..." },
        "tradeScenarios": { "bullish": "...", "bearish": "...", "invalidation": "..." },
        "riskAssessment": { "score": 1-10, "volatility": "..." },
        "verdict": { "entryLogic": "...", "stopLossLogic": "...", "recommendation": "Trade/Wait" },
        "trend": "Bullish/Bearish",
        "entry": number,
        "stopLoss": number,
        "tp1": number,
        "tp2": number,
        "tp3": number,
        "riskScore": number,
        "warnings": ["..."],
        "scenarios": { "mostLikely": "...", "bullish": "...", "bearish": "..." },
        "momentum": "Strong/Weak",
        "supports": ["..."],
        "resistances": ["..."],
        "pattern": "..."
     }
   `;

    const imagePart = {
        inlineData: {
            data: imageBase64.split(',')[1],
            mimeType
        }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);

    if (data.error) {
        throw new Error(data.error);
    }

    return data as ChartAnalysisData;
};

// Helper
function formatCompactNumber(number: number) {
    const formatter = Intl.NumberFormat("en", { notation: "compact" });
    return formatter.format(number);
}

// --- Chatbot --- (Keep legacy or minimal)
export const startChat = () => { };
export const getInitialBotMessage = () => "System Ready.";
export const sendMessageToBot = async () => "Chat disabled for Analysis Mode.";
export const explainConcept = async () => "Feature pending.";
