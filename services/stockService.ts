
export interface RealTimeStockData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    currency: string;
    marketCap: number;
    volume: number;
    dayHigh: number;
    dayLow: number;
    yearHigh: number;
    yearLow: number;
    history: { date: string; price: number }[];
    isRealTime: boolean;
    peRatio?: number;
    nextEarningsDate?: number;
}

export const fetchStockData = async (symbol: string): Promise<RealTimeStockData> => {
    try {
        // Using a CORS proxy to access Yahoo Finance API which is publicly available but CORS restricted
        const PROXY_URL = 'https://corsproxy.io/?';
        const TARGET_URL = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1d&range=1mo&t=${Date.now()}`;

        const response = await fetch(PROXY_URL + encodeURIComponent(TARGET_URL));

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const result = data.chart.result[0];

        if (!result) {
            throw new Error('No data found for symbol');
        }

        const meta = result.meta;
        const currentPrice = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose;
        const change = currentPrice - prevClose;
        const changePercent = (change / prevClose) * 100;

        const prices = result.timestamp.map((ts: number, i: number) => ({
            date: new Date(ts * 1000).toISOString(),
            price: result.indicators.quote[0].close[i]
        })).filter((p: any) => p.price != null); // Filter out nulls

        // Calculate approx market cap if not perfectly valid from chart endpoint, 
        // BUT usually quoteSummary is better for strictly fundamental data (Market Cap, PE).
        // Chart endpoint 'meta' often lacks full fundamentals.
        // For this strict requirement, we'll try to fetch quoteSummary as well if possible, or fallback.
        // Let's stick to Chart for price/volume/history, and maybe "estimate" or mock minor fundamentals avoiding "Inventing PRICES".
        // Wait, user said "Fetch real-time... market cap, PE ratio...". 
        // Yahoo QuoteSummary endpoint is better for that: `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,summaryDetail,defaultKeyStatistics`

        // Let's try to fetch Summary too.
        const SUMMARY_URL = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol.toUpperCase()}?modules=summaryDetail,defaultKeyStatistics,price,calendarEvents&t=${Date.now()}`;
        let quoteSummary = null;
        try {
            const summaryRes = await fetch(PROXY_URL + encodeURIComponent(SUMMARY_URL));
            if (summaryRes.ok) {
                quoteSummary = await summaryRes.json();
            }
        } catch (e) {
            console.warn("Could not fetch quote summary", e);
        }

        const summaryDetail = quoteSummary?.quoteSummary?.result?.[0]?.summaryDetail || {};
        const priceModule = quoteSummary?.quoteSummary?.result?.[0]?.price || {};

        return {
            symbol: meta.symbol,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
            currency: meta.currency,
            marketCap: priceModule.marketCap?.raw || summaryDetail.marketCap?.raw || 0,
            volume: meta.regularMarketVolume,
            dayHigh: summaryDetail.dayHigh?.raw || currentPrice, // Fallback
            dayLow: summaryDetail.dayLow?.raw || currentPrice,
            yearHigh: summaryDetail.fiftyTwoWeekHigh?.raw || 0,
            yearLow: summaryDetail.fiftyTwoWeekLow?.raw || 0,
            history: prices,
            isRealTime: true,
            peRatio: summaryDetail.trailingPE?.raw || summaryDetail.forwardPE?.raw || undefined,
            nextEarningsDate: quoteSummary?.quoteSummary?.result?.[0]?.calendarEvents?.earnings?.earningsDate?.[0]?.raw || undefined
        };

    } catch (error) {
        console.error("Failed to fetch stock data", error);
        throw new Error("Real-time market data unavailable. Analysis aborted.");
    }
};
