import { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import type { DepthLevel } from '../types';

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

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setError(null);
    setBids([]);
    setAsks([]);

    const fetchDepth = async () => {
      try {
        const res = await client.get(`/depth/${symbol}`);
        if (!mountedRef.current) return;
        const data = res.data;
        setBids(data.bids ?? []);
        setAsks(data.asks ?? []);
        setError(null);
      } catch (err: unknown) {
        if (!mountedRef.current) return;
        const message = err instanceof Error ? err.message : 'Failed to fetch order book';
        setError(message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchDepth();
    const interval = setInterval(fetchDepth, 1000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [symbol]);

  return { bids, asks, loading, error };
}
