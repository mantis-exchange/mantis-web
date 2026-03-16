import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import client from '../api/client';
import { useWebSocket } from './useWebSocket';
import type { Trade } from '../types';

const MAX_TRADES = 50;

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

  // Initial REST fetch
  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setError(null);
    setTrades([]);

    const fetchTrades = async () => {
      try {
        const res = await client.get(`/trades/${symbol}`);
        if (!mountedRef.current) return;
        const list = res.data.trades ?? res.data;
        setTrades(Array.isArray(list) ? list : []);
        setError(null);
      } catch (err: unknown) {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch trades');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchTrades();

    return () => {
      mountedRef.current = false;
    };
  }, [symbol]);

  // WebSocket subscription for real-time updates
  const subscriptions = useMemo(() => [{ channel: 'trades', symbol }], [symbol]);

  const handleMessage = useCallback(
    (msg: { channel: string; symbol: string; data: unknown }) => {
      if (msg.channel === 'trades' && msg.symbol === symbol) {
        const trade = msg.data as Trade;
        setTrades((prev) => [trade, ...prev].slice(0, MAX_TRADES));
        setLoading(false);
      }
    },
    [symbol],
  );

  useWebSocket(subscriptions, handleMessage);

  return { trades, loading, error };
}
