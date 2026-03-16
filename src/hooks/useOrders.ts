import { useState, useEffect, useRef, useCallback } from 'react';
import client from '../api/client';

interface OrderItem {
  id: string;
  symbol: string;
  side: string;
  type: string;
  price: string;
  quantity: string;
  filled_quantity: string;
  status: string;
  created_at: number;
}

interface UseOrdersResult {
  orders: OrderItem[];
  loading: boolean;
  refresh: () => void;
}

export function useOrders(symbol: string): UseOrdersResult {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await client.get('/orders', { params: { limit: 50 } });
      if (!mountedRef.current) return;
      const all = res.data.orders ?? [];
      // Filter by current symbol
      setOrders(all.filter((o: OrderItem) => o.symbol === symbol));
      setLoading(false);
    } catch {
      if (mountedRef.current) setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    fetchOrders();
    // Poll every 5 seconds for status updates
    const interval = setInterval(fetchOrders, 5000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchOrders]);

  return { orders, loading, refresh: fetchOrders };
}
