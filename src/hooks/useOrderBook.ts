import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import client from '../api/client';
import { useWebSocket } from './useWebSocket';
import type { DepthLevel } from '../types';

// Normalize depth data: REST returns [["price","qty"]] arrays, convert to {price, quantity} objects
function normalizeDepth(levels: unknown): DepthLevel[] {
  if (!Array.isArray(levels)) return [];
  return levels.map((lvl: unknown) => {
    if (Array.isArray(lvl)) return { price: lvl[0], quantity: lvl[1] };
    return lvl as DepthLevel;
  });
}

interface UseOrderBookResult {
  bids: DepthLevel[];
  asks: DepthLevel[];
  loading: boolean;
  error: string | null;
}

export function useOrderBook(symbol: string): UseOrderBookResult {
  const [bids, setBids] = useState<DepthLevel[]>([]);
  const [asks, setAsks] = useState<DepthLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Initial REST fetch
  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setError(null);

    const fetchDepth = async () => {
      try {
        const res = await client.get(`/depth/${symbol}`);
        if (!mountedRef.current) return;
        setBids(normalizeDepth(res.data.bids));
        setAsks(normalizeDepth(res.data.asks));
        setError(null);
      } catch (err: unknown) {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch order book');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchDepth();

    return () => {
      mountedRef.current = false;
    };
  }, [symbol]);

  // WebSocket subscription for real-time updates
  const subscriptions = useMemo(() => [{ channel: 'depth', symbol }], [symbol]);

  const handleMessage = useCallback(
    (msg: { channel: string; symbol: string; data: unknown }) => {
      if (msg.channel === 'depth' && msg.symbol === symbol) {
        const data = msg.data as { bids?: string[][]; asks?: string[][] };
        if (data.bids)
          setBids(data.bids.map(([price, quantity]) => ({ price, quantity })));
        if (data.asks)
          setAsks(data.asks.map(([price, quantity]) => ({ price, quantity })));
        setLoading(false);
      }
    },
    [symbol],
  );

  useWebSocket(subscriptions, handleMessage);

  return { bids, asks, loading, error };
}
