
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { StockAnalysisData, ChartAnalysisData } from '../types';

// Initialize Gemini AI (only used for analysis, NOT for price fetching)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ============================================================
//  REAL-TIME PRICE FETCHER - Yahoo Finance (free, no API key)
// ============================================================
interface YahooPrice {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    currency: string;
    dayHigh: number;
    dayLow: number;
    volume: number;
    marketCap: number | null;
    exchange: string;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
}

async function fetchRealTimePrice(symbol: string): Promise<YahooPrice> {
    const yahooSymbol = symbol.toUpperCase().trim();
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;

    // Try multiple CORS proxies as fallback
    const proxies = [
        (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url: string) => `https://corsproxy.org/?url=${encodeURIComponent(url)}`,
        (url: string) => url, // Direct — might work on some networks
    ];

    let lastError: any = null;

    for (const proxy of proxies) {
        try {
            const proxyUrl = proxy(yahooUrl);
            const response = await fetch(proxyUrl, {
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(8000),
            });

            if (!response.ok) continue;

            const data = await response.json();
            const result = data?.chart?.result?.[0];
            if (!result) continue;

            const meta = result.meta;
            const regularMarketPrice = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose || meta.previousClose || regularMarketPrice;
            const change = regularMarketPrice - previousClose;
            const changePercent = (change / previousClose) * 100;

            return {
                symbol: yahooSymbol,
                name: meta.longName || meta.shortName || yahooSymbol,
                price: regularMarketPrice,
                change: Math.round(change * 100) / 100,
                changePercent: Math.round(changePercent * 100) / 100,
                currency: meta.currency || 'USD',
                dayHigh: meta.regularMarketDayHigh || regularMarketPrice,
                dayLow: meta.regularMarketDayLow || regularMarketPrice,
                volume: meta.regularMarketVolume || 0,
                marketCap: meta.marketCap || null,
                exchange: meta.exchangeName || '',
                fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
                fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
            };
        } catch (err) {
            lastError = err;
            continue;
        }
    }

    throw new Error(`Could not fetch price for ${symbol}: ${lastError?.message || 'All proxies failed'}`);
}

// Helpers
function formatMarketCap(num: number | null | undefined): string {
    if (!num) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
}

function formatVolume(num: number | null | undefined): string {
    if (!num) return "N/A";
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return `${num}`;
}

// Map common names to Yahoo Finance tickers
// NOTE: Any symbol NOT in this list will still work — it goes directly to Yahoo Finance
function resolveSymbol(input: string): string {
    const map: Record<string, string> = {
        // ── Crypto ──
        'bitcoin': 'BTC-USD', 'btc': 'BTC-USD', 'btc/usd': 'BTC-USD',
        'ethereum': 'ETH-USD', 'eth': 'ETH-USD', 'eth/usd': 'ETH-USD',
        'solana': 'SOL-USD', 'sol': 'SOL-USD',
        'dogecoin': 'DOGE-USD', 'doge': 'DOGE-USD',
        'xrp': 'XRP-USD', 'ripple': 'XRP-USD',
        'cardano': 'ADA-USD', 'ada': 'ADA-USD',
        'polkadot': 'DOT-USD', 'dot': 'DOT-USD',
        'litecoin': 'LTC-USD', 'ltc': 'LTC-USD',
        'bnb': 'BNB-USD', 'binance': 'BNB-USD',
        'avalanche': 'AVAX-USD', 'avax': 'AVAX-USD',
        'shiba': 'SHIB-USD', 'shib': 'SHIB-USD',
        'polygon': 'MATIC-USD', 'matic': 'MATIC-USD',

        // ── Forex ──
        'usdjpy': 'USDJPY=X', 'usd/jpy': 'USDJPY=X',
        'eurusd': 'EURUSD=X', 'eur/usd': 'EURUSD=X',
        'gbpusd': 'GBPUSD=X', 'gbp/usd': 'GBPUSD=X',
        'usdinr': 'USDINR=X', 'usd/inr': 'USDINR=X',
        'gbpjpy': 'GBPJPY=X', 'gbp/jpy': 'GBPJPY=X',
        'eurjpy': 'EURJPY=X', 'eur/jpy': 'EURJPY=X',
        'audusd': 'AUDUSD=X', 'aud/usd': 'AUDUSD=X',
        'usdcad': 'USDCAD=X', 'usd/cad': 'USDCAD=X',
        'usdchf': 'USDCHF=X', 'usd/chf': 'USDCHF=X',
        'nzdusd': 'NZDUSD=X', 'nzd/usd': 'NZDUSD=X',
        'eurgbp': 'EURGBP=X', 'eur/gbp': 'EURGBP=X',
        'usdcny': 'USDCNY=X', 'usd/cny': 'USDCNY=X',
        'usdrub': 'USDRUB=X', 'usd/rub': 'USDRUB=X',

        // ── Commodities ──
        'gold': 'GC=F', 'xauusd': 'GC=F', 'xau/usd': 'GC=F',
        'silver': 'SI=F', 'xagusd': 'SI=F', 'xag/usd': 'SI=F',
        'crude oil': 'CL=F', 'oil': 'CL=F', 'wti': 'CL=F',
        'brent': 'BZ=F', 'brent oil': 'BZ=F',
        'natural gas': 'NG=F', 'natgas': 'NG=F',
        'copper': 'HG=F', 'platinum': 'PL=F',

        // ── US Stocks ──
        'tesla': 'TSLA', 'apple': 'AAPL', 'google': 'GOOGL', 'alphabet': 'GOOGL',
        'amazon': 'AMZN', 'microsoft': 'MSFT', 'nvidia': 'NVDA',
        'meta': 'META', 'facebook': 'META',
        'netflix': 'NFLX', 'disney': 'DIS',
        'amd': 'AMD', 'intel': 'INTC',
        'paypal': 'PYPL', 'visa': 'V', 'mastercard': 'MA',
        'jpmorgan': 'JPM', 'goldman sachs': 'GS', 'bank of america': 'BAC',
        'walmart': 'WMT', 'costco': 'COST', 'target': 'TGT',
        'coca cola': 'KO', 'pepsi': 'PEP', 'mcdonalds': 'MCD',
        'boeing': 'BA', 'lockheed': 'LMT',
        'uber': 'UBER', 'airbnb': 'ABNB', 'spotify': 'SPOT',
        'palantir': 'PLTR', 'snowflake': 'SNOW', 'crowdstrike': 'CRWD',
        'berkshire': 'BRK-B', 'johnson': 'JNJ',
        'pfizer': 'PFE', 'moderna': 'MRNA',
        'coinbase': 'COIN', 'robinhood': 'HOOD',

        // ── Indian Stocks (NSE) ──
        'reliance': 'RELIANCE.NS', 'tcs': 'TCS.NS', 'infosys': 'INFY.NS',
        'hdfc': 'HDFCBANK.NS', 'hdfc bank': 'HDFCBANK.NS',
        'icici': 'ICICIBANK.NS', 'icici bank': 'ICICIBANK.NS',
        'sbi': 'SBIN.NS', 'state bank': 'SBIN.NS',
        'kotak': 'KOTAKBANK.NS', 'kotak bank': 'KOTAKBANK.NS',
        'wipro': 'WIPRO.NS', 'hcl': 'HCLTECH.NS',
        'bharti airtel': 'BHARTIARTL.NS', 'airtel': 'BHARTIARTL.NS',
        'tata motors': 'TATAMOTORS.NS', 'tata steel': 'TATASTEEL.NS',
        'tata power': 'TATAPOWER.NS', 'tata elxsi': 'TATAELXSI.NS',
        'adani': 'ADANIENT.NS', 'adani enterprises': 'ADANIENT.NS',
        'adani ports': 'ADANIPORTS.NS', 'adani green': 'ADANIGREEN.NS',
        'bajaj finance': 'BAJFINANCE.NS', 'bajaj finserv': 'BAJAJFINSV.NS',
        'maruti': 'MARUTI.NS', 'maruti suzuki': 'MARUTI.NS',
        'asian paints': 'ASIANPAINT.NS', 'sun pharma': 'SUNPHARMA.NS',
        'itc': 'ITC.NS', 'hindustan unilever': 'HINDUNILVR.NS', 'hul': 'HINDUNILVR.NS',
        'larsen': 'LT.NS', 'l&t': 'LT.NS',
        'mahindra': 'M&M.NS', 'power grid': 'POWERGRID.NS',
        'ntpc': 'NTPC.NS', 'ongc': 'ONGC.NS',
        'axis bank': 'AXISBANK.NS', 'indusind': 'INDUSINDBK.NS',
        'zomato': 'ZOMATO.NS', 'paytm': 'PAYTM.NS',
        'nifty': '^NSEI', 'sensex': '^BSESN', 'nifty 50': '^NSEI', 'bank nifty': '^NSEBANK',
    };
    const lower = input.toLowerCase().trim();
    return map[lower] || input.toUpperCase().trim();
}

// ============================================================
//  STOCK ANALYZER — Real price from Yahoo + AI analysis
// ============================================================
export const analyzeStock = async (symbol: string): Promise<StockAnalysisData> => {

    const resolvedSymbol = resolveSymbol(symbol);

    // STEP 1: Fetch real-time price from Yahoo Finance
    let priceData: YahooPrice | null = null;
    let priceError = false;
    try {
        priceData = await fetchRealTimePrice(resolvedSymbol);
        console.log("✅ Real price fetched:", priceData.price, priceData.currency);
    } catch (err) {
        console.warn("⚠️ Yahoo Finance fetch failed, will rely on Gemini search:", err);
        priceError = true;
    }

    // STEP 2: Ask Gemini to analyze the company (it gets the verified price)
    const priceContext = priceData
        ? `The VERIFIED REAL-TIME price data from Yahoo Finance is:
- Current Price: ${priceData.price} ${priceData.currency}
- Change Today: ${priceData.change} (${priceData.changePercent}%)
- Day High: ${priceData.dayHigh}, Day Low: ${priceData.dayLow}
- 52W High: ${priceData.fiftyTwoWeekHigh}, 52W Low: ${priceData.fiftyTwoWeekLow}
- Volume: ${priceData.volume}
- Market Cap: ${priceData.marketCap || 'N/A'}
- Exchange: ${priceData.exchange}

USE THESE EXACT NUMBERS in the price fields. Do not change them.`
        : `Use Google Search to find the current real-time price for ${resolvedSymbol}.`;

    const prompt = `You are an institutional-grade AI Trading Analyst.

${priceContext}

Now analyze the company/asset "${symbol}" (ticker: ${resolvedSymbol}) and generate a complete JSON dossier.

STRICT OUTPUT RULES:
- Output ONLY valid JSON — no markdown, no explanation, no backticks.
- All number fields must be actual numbers (not strings).
- Do NOT invent prices — use ONLY the verified data above.

JSON STRUCTURE (fill every field):
{
  "company": {
    "name": "...", "ticker": "...", "sector": "...", "industry": "...",
    "ceo": "...", "headquarters": "...", "founded": "...",
    "description": "...", "exchange": "..."
  },
  "price": {
    "current": ${priceData?.price || 0},
    "change": ${priceData?.change || 0},
    "changePercent": ${priceData?.changePercent || 0},
    "currency": "${priceData?.currency || 'USD'}",
    "marketCap": "${formatMarketCap(priceData?.marketCap)}",
    "volume": "${formatVolume(priceData?.volume)}",
    "dayHigh": ${priceData?.dayHigh || 0},
    "dayLow": ${priceData?.dayLow || 0},
    "yearHigh": ${priceData?.fiftyTwoWeekHigh || 0},
    "yearLow": ${priceData?.fiftyTwoWeekLow || 0},
    "peRatio": "...",
    "eps": "...",
    "dividendYield": "...",
    "nextEarningsDate": "..."
  },
  "fundamentals": {
    "revenueTrend": "...", "profitability": "...", "debtStatus": "...",
    "valuation": "Overvalued/Fair/Undervalued", "valuationReason": "..."
  },
  "riskAnalysis": {
    "marketRisk": "...", "newsRisk": "...",
    "volatility": "Low/Medium/High", "riskScore": 5
  },
  "futureOutlook": { "shortTerm": "...", "midTerm": "...", "longTerm": "..." },
  "technicalAnalysis": {
    "trend": "Bullish/Bearish/Neutral", "rsi": "...", "macd": "...",
    "keySupport": ["...", "..."], "keyResistance": ["...", "..."]
  },
  "keyLevels": { "support": ["...", "..."], "resistance": ["...", "..."] },
  "verdict": { "action": "Buy/Hold/Avoid", "targetAudience": "Trader/Investor", "reasoning": "..." },
  "analysis": {
    "recommendation": "Buy/Sell/Hold",
    "confidence": 70,
    "trend": "Bullish/Bearish/Neutral",
    "targetPrice1W": 0,
    "targetPrice1M": 0,
    "targetPrice1Y": 0
  },
  "news": [
    { "headline": "...", "time": "...", "summary": "...", "sentiment": "Positive/Negative/Neutral", "impact": "High/Medium/Low" }
  ],
  "tradeSetup": {
    "trend": "Bullish/Bearish/Neutral",
    "entry": ${priceData?.price || 0},
    "stopLoss": 0,
    "tp1": 0, "tp2": 0, "tp3": 0,
    "riskScore": 5,
    "warnings": ["..."],
    "scenarios": { "mostLikely": "...", "bullish": "...", "bearish": "..." },
    "momentum": "Strong/Weak/Neutral",
    "supports": ["...", "..."],
    "resistances": ["...", "..."],
    "pattern": "..."
  },
  "explanation": "..."
}`;

    try {
        const searchModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: priceError ? [
                // @ts-ignore
                { googleSearch: {} }
            ] : []
        });

        const result = await searchModel.generateContent(prompt);
        const text = result.response.text();

        // Robust JSON extraction
        let jsonString = text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) jsonString = jsonMatch[0];
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

        const aiData = JSON.parse(jsonString);

        // Always use Yahoo Finance price if available
        const finalPrice = priceData?.price || aiData.price?.current || 0;
        const finalChange = priceData?.change ?? aiData.price?.change ?? 0;
        const finalChangePercent = priceData?.changePercent ?? aiData.price?.changePercent ?? 0;

        return {
            ...aiData,
            company: aiData.company || {},
            price: {
                current: finalPrice,
                change: finalChange,
                changePercent: finalChangePercent,
                currency: priceData?.currency || aiData.price?.currency || "USD",
                marketCap: formatMarketCap(priceData?.marketCap) || aiData.price?.marketCap || "N/A",
                volume: formatVolume(priceData?.volume) || aiData.price?.volume || "N/A",
                avgVolume: "N/A",
                dayHigh: priceData?.dayHigh || aiData.price?.dayHigh || 0,
                dayLow: priceData?.dayLow || aiData.price?.dayLow || 0,
                yearHigh: priceData?.fiftyTwoWeekHigh || aiData.price?.yearHigh || 0,
                yearLow: priceData?.fiftyTwoWeekLow || aiData.price?.yearLow || 0,
                peRatio: aiData.price?.peRatio || "N/A",
                eps: aiData.price?.eps || "N/A",
                dividendYield: aiData.price?.dividendYield || "N/A",
                nextEarningsDate: aiData.price?.nextEarningsDate || "N/A",
            },
            keyLevels: aiData.keyLevels || { support: [], resistance: [] },
            chartData: [],
            news: aiData.news || [],
            tradeSetup: {
                ...(aiData.tradeSetup || {}),
                entry: finalPrice,
            },
            forecast: {
                probBullish: aiData.analysis?.recommendation === 'Buy' ? 70 : 30,
                probBearish: aiData.analysis?.recommendation === 'Sell' ? 70 : 30,
                projection1M: aiData.futureOutlook?.shortTerm || "N/A",
                projection1Y: aiData.futureOutlook?.longTerm || "N/A",
            },
        } as StockAnalysisData;

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        throw new Error("AI could not analyze the data right now. Please try again.");
    }
};

// ============================================================
//  CHART ANALYZER — Vision model
// ============================================================
export const analyzeChart = async (imageBase64: string, mimeType: string, timeframe: string): Promise<ChartAnalysisData> => {
    const prompt = `You are an expert technical analyst reviewing an uploaded image.

STEP 1 — VALIDATE THE IMAGE (do this first before anything else):

Case A - NOT a trading chart:
If the image is a selfie, photo, screenshot of text, random object, landscape, or anything that is NOT a financial trading chart (candlestick, line chart, bar chart, OHLC, etc.) — return ONLY this JSON:
{ "error": "This is not a trading chart. Please upload a candlestick or line chart from any trading platform.", "errorType": "not_a_chart" }

Case B - BLURRY or UNCLEAR chart:
If the image IS a trading chart but it is too blurry, too low resolution, too dark, too zoomed out, or the price levels / candles cannot be clearly read — return ONLY this JSON:
{ "error": "The chart is not clear enough to analyze. Please upload a higher quality or zoomed-in screenshot of the chart.", "errorType": "blur" }

Case C - VALID chart:
If the image is a clear, readable trading chart — perform a full technical analysis.

STEP 2 — OUTPUT (only for Case C):
Output ONLY valid JSON (no markdown, no backticks):
{
  "buyRecommendation": {
    "action": "Buy/Sell/Wait",
    "shouldBuy": true,
    "confidence": 75,
    "summary": "One line verdict: e.g. Strong buy signal with bullish breakout above key resistance.",
    "reasons": [
      "Reason 1 why to buy/sell/wait (technical reason from the chart)",
      "Reason 2 (pattern or indicator based)",
      "Reason 3 (risk/reward based)"
    ],
    "riskWarning": "Main risk to watch out for e.g. If price drops below support at X, exit immediately."
  },
  "chartType": { "timeframe": "${timeframe}", "asset": "Stocks/Crypto/Forex" },
  "trendAnalysis": { "marketStructure": "Bullish/Bearish/Range", "confirmation": "..." },
  "keyLevels": { "support": ["..."], "resistance": ["..."] },
  "patternDetection": { "pattern": "...", "status": "Breakout/Developing" },
  "indicators": { "rsi": "...", "macd": "...", "ma": "..." },
  "tradeScenarios": { "bullish": "...", "bearish": "...", "invalidation": "..." },
  "riskAssessment": { "score": 5, "volatility": "..." },
  "verdict": { "entryLogic": "...", "stopLossLogic": "...", "recommendation": "Trade/Wait" },
  "trend": "Bullish/Bearish",
  "entry": 0,
  "stopLoss": 0,
  "tp1": 0, "tp2": 0, "tp3": 0,
  "riskScore": 5,
  "warnings": ["..."],
  "scenarios": { "mostLikely": "...", "bullish": "...", "bearish": "..." },
  "momentum": "Strong/Weak",
  "supports": ["..."],
  "resistances": ["..."],
  "pattern": "..."
}`;

    const imagePart = {
        inlineData: {
            data: imageBase64.split(',')[1],
            mimeType
        }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);

    if (data.error) throw new Error(data.error);
    return data as ChartAnalysisData;
};

// Legacy stubs
export const STOCK_ANALYSIS_PROMPT = '';
export const startChat = () => { };
export const getInitialBotMessage = () => "System Ready.";
export const sendMessageToBot = async () => "Chat disabled for Analysis Mode.";
export const explainConcept = async () => "Feature pending.";
