
import { useState, useEffect, useCallback } from 'react';
import type { TickerData, Theme } from './types';

const MOCK_SYMBOLS: Omit<TickerData, 'price' | 'change' | 'changePercent' | 'high' | 'low'>[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', market: 'Stocks' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'Stocks' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', market: 'Stocks' },
    { symbol: 'BTC', name: 'Bitcoin', market: 'Crypto' },
    { symbol: 'ETH', name: 'Ethereum', market: 'Crypto' },
    { symbol: 'EUR/USD', name: 'Euro to US Dollar', market: 'Forex' },
    { symbol: 'SPX', name: 'S&P 500', market: 'Indices' },
    { symbol: 'NDAQ', name: 'Nasdaq 100', market: 'Indices' },
    { symbol: 'DOGE', name: 'Dogecoin', market: 'Crypto' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'Stocks' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', market: 'Stocks' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'Stocks' },
    { symbol: 'XRP', name: 'Ripple', market: 'Crypto' },
    { symbol: 'GBP/JPY', name: 'British Pound to Japanese Yen', market: 'Forex' },
    { symbol: 'GOLD', name: 'Gold Spot', market: 'Indices' },
    { symbol: 'NIFTY50', name: 'Nifty 50', market: 'Indices' },
];

export function useLocalStorage<T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}


export function useMarketData() {
    const [marketData, setMarketData] = useState<TickerData[]>(() => 
        MOCK_SYMBOLS.map(s => {
            const price = Math.random() * (s.market === 'Crypto' ? 50000 : s.market === 'Forex' ? 2 : 500) + 20;
            return { ...s, price, change: 0, changePercent: 0, high: price, low: price };
        })
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setMarketData(prevData =>
                prevData.map(ticker => {
                    const changePercent = (Math.random() - 0.5) * 0.02; // Max 1% change
                    const newPrice = ticker.price * (1 + changePercent);
                    const change = newPrice - ticker.price;
                    
                    return {
                        ...ticker,
                        price: newPrice,
                        change: change,
                        changePercent: (change / ticker.price) * 100,
                        high: Math.max(ticker.high, newPrice),
                        low: Math.min(ticker.low, newPrice),
                    };
                })
            );
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return marketData;
}

export function useTheme(): { theme: Theme, toggleTheme: () => void } {
  const [theme, setTheme] = useLocalStorage<Theme>('tradesnap_theme', 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}
