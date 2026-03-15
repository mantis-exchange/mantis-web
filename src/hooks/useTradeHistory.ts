import { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import type { Trade } from '../types';

interface UseTradeHistoryResult {
  trades: Trade[];
  loading: boolean;
  error: string | null;
}

export function useTradeHistory(symbol: string): UseTradeHistoryResult {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setError(null);
    setTrades([]);

    const fetchTrades = async () => {
      try {
        const res = await client.get(`/trades/${symbol}`);
        if (!mountedRef.current) return;
        setTrades(res.data.trades ?? res.data ?? []);
        setError(null);
      } catch (err: unknown) {
        if (!mountedRef.current) return;
        const message = err instanceof Error ? err.message : 'Failed to fetch trades';
        setError(message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 2000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [symbol]);

  return { trades, loading, error };
}
