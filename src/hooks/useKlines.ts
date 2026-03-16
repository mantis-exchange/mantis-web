import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import type { CandleData, Trade } from '../types';

function getMarketDataUrl(): string {
  if (import.meta.env.VITE_MARKET_DATA_URL) return import.meta.env.VITE_MARKET_DATA_URL;
  const host = window.location.hostname;
  if (host.startsWith('cex.')) {
    return `${window.location.protocol}//cex-api.${host.slice(4)}/api/v1`;
  }
  return '/api/v1';
}
const MARKET_DATA_URL = getMarketDataUrl();

interface UseKlinesResult {
  candles: CandleData[];
  loading: boolean;
}

export function useKlines(symbol: string, interval: string = '1m'): UseKlinesResult {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  // Initial REST fetch from market-data service
  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    const fetchKlines = async () => {
      try {
        const res = await fetch(
          `${MARKET_DATA_URL}/klines?symbol=${symbol}&interval=${interval}&limit=200`,
        );
        if (!mountedRef.current) return;
        const json = await res.json();
        const data = Array.isArray(json) ? json : json.klines ?? json;
        if (Array.isArray(data)) {
          const mapped: CandleData[] = data.map(
            (k: { open_time: string; open: string; high: string; low: string; close: string }) => ({
              time: Math.floor(new Date(k.open_time).getTime() / 1000),
              open: parseFloat(k.open),
              high: parseFloat(k.high),
              low: parseFloat(k.low),
              close: parseFloat(k.close),
            }),
          );
          setCandles(mapped);
        }
      } catch {
        // silently fail - chart will be empty
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchKlines();
    return () => {
      mountedRef.current = false;
    };
  }, [symbol, interval]);

  // Real-time updates from trades WS channel
  const subscriptions = useMemo(() => [{ channel: 'trades', symbol }], [symbol]);

  const handleMessage = useCallback(
    (msg: { channel: string; symbol: string; data: unknown }) => {
      if (msg.channel === 'trades' && msg.symbol === symbol) {
        const trade = msg.data as Trade;
        const price = parseFloat(trade.price);
        const tradeTime = Math.floor(trade.created_at / 1000);
        // Round down to current candle boundary
        const intervalMap: Record<string, number> = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400 };
        const intervalSecs = intervalMap[interval] || 60;
        const candleTime = tradeTime - (tradeTime % intervalSecs);

        setCandles((prev) => {
          if (prev.length === 0) return prev;

          const last = prev[prev.length - 1];
          if (last.time === candleTime) {
            // Update existing candle
            return [
              ...prev.slice(0, -1),
              {
                ...last,
                high: Math.max(last.high, price),
                low: Math.min(last.low, price),
                close: price,
              },
            ];
          } else if (candleTime > last.time) {
            // New candle
            return [...prev, { time: candleTime, open: price, high: price, low: price, close: price }];
          }
          return prev;
        });
      }
    },
    [symbol, interval],
  );

  useWebSocket(subscriptions, handleMessage);

  return { candles, loading };
}
