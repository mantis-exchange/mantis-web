import { useState } from 'react';
import { Side, OrderType } from '../types';
import client from '../api/client';

interface TradeFormProps {
  symbol: string;
}

export default function TradeForm({ symbol }: TradeFormProps) {
  const [side, setSide] = useState<Side>(Side.Buy);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.Limit);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await client.post('/orders', {
        symbol,
        side,
        order_type: orderType,
        price: orderType === OrderType.Limit ? price : undefined,
        quantity,
      });
      setPrice('');
      setQuantity('');
    } catch (err) {
      console.error('Order failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="trade-form" onSubmit={handleSubmit}>
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
