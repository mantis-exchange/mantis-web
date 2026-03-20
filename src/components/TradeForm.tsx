import { useState, useEffect } from 'react';
import { Side, OrderType } from '../types';
import client from '../api/client';

interface TradeFormProps {
  symbol: string;
  defaultPrice?: string;
}

interface Notification {
  message: string;
  type: 'success' | 'error';
}

export default function TradeForm({ symbol, defaultPrice }: TradeFormProps) {
  const [side, setSide] = useState<Side>(Side.Buy);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.Limit);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  // When user clicks a price in the OrderBook, pre-fill the price field
  useEffect(() => {
    if (defaultPrice) {
      setPrice(defaultPrice);
      setOrderType(OrderType.Limit);
    }
  }, [defaultPrice]);

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);
    try {
      const res = await client.post('/orders', {
        symbol,
        side: side.toLowerCase(),
        type: orderType.toLowerCase(),
        price: orderType === OrderType.Limit ? price : undefined,
        qty: quantity,
      });
      const trades = res.data?.trades;
      const orderId = res.data?.id ?? res.data?.order_id ?? '';
      let message = `Order placed`;
      if (orderId) message += ` (${orderId.slice(0, 8)}...)`;
      if (trades && trades.length > 0) {
        message += ` — ${trades.length} fill${trades.length > 1 ? 's' : ''}`;
      }
      setNotification({ message, type: 'success' });
      window.dispatchEvent(new Event('mantis:balance-refresh'));
      setPrice('');
      setQuantity('');
    } catch (err: unknown) {
      let message = 'Order failed';
      if (err && typeof err === 'object' && 'response' in err) {
        const resp = (err as { response?: { data?: { error?: string; message?: string } } }).response;
        message = resp?.data?.error ?? resp?.data?.message ?? message;
      }
      setNotification({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="trade-form" onSubmit={handleSubmit}>
      {notification && (
        <div className={`trade-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="trade-form-tabs">
        <button
          type="button"
          className={`trade-form-tab ${side === Side.Buy ? 'active-buy' : ''}`}
          onClick={() => setSide(Side.Buy)}
        >
          Buy
        </button>
        <button
          type="button"
          className={`trade-form-tab ${side === Side.Sell ? 'active-sell' : ''}`}
          onClick={() => setSide(Side.Sell)}
        >
          Sell
        </button>
      </div>

      <div className="form-group">
        <label>Order Type</label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value as OrderType)}
        >
          <option value={OrderType.Limit}>Limit</option>
          <option value={OrderType.Market}>Market</option>
        </select>
      </div>

      {orderType === OrderType.Limit && (
        <div className="form-group">
          <label>Price (USDT)</label>
          <input
            type="number"
            step="any"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      )}

      <div className="form-group">
        <label>Quantity</label>
        <input
          type="number"
          step="any"
          placeholder="0.00"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      {orderType === OrderType.Limit && price && quantity && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '8px 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Total</span>
            <span style={{ color: 'var(--text-primary)', fontFamily: "'SF Mono','Fira Code',monospace" }}>
              {(parseFloat(price) * parseFloat(quantity)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {symbol.split('-')[1]}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Fee (est. 0.2%)</span>
            <span style={{ fontFamily: "'SF Mono','Fira Code',monospace" }}>
              {side === Side.Buy
                ? (parseFloat(quantity) * 0.002).toFixed(6) + ' ' + symbol.split('-')[0]
                : (parseFloat(price) * parseFloat(quantity) * 0.002).toFixed(2) + ' ' + symbol.split('-')[1]
              }
            </span>
          </div>
        </div>
      )}

      <button
        type="submit"
        className={`submit-btn ${side === Side.Buy ? 'buy' : 'sell'}`}
        disabled={loading}
      >
        {loading ? '...' : side === Side.Buy ? `Buy ${symbol.split('-')[0]}` : `Sell ${symbol.split('-')[0]}`}
      </button>
    </form>
  );
}
