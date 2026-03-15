import { useMemo } from 'react';
import type { DepthLevel } from '../types';

interface OrderBookProps {
  bids: DepthLevel[];
  asks: DepthLevel[];
  onPriceClick?: (price: string) => void;
}

export default function OrderBook({ bids, asks, onPriceClick }: OrderBookProps) {
  const asksWithCumulative = useMemo(() => {
    let cum = 0;
    return [...asks].reverse().map((level) => {
      cum += parseFloat(level.quantity);
      return { ...level, cumulative: cum.toFixed(4) };
    });
  }, [asks]);

  const bidsWithCumulative = useMemo(() => {
    let cum = 0;
    return bids.map((level) => {
      cum += parseFloat(level.quantity);
      return { ...level, cumulative: cum.toFixed(4) };
    });
  }, [bids]);

  const spread = useMemo(() => {
    if (asks.length > 0 && bids.length > 0) {
      const bestAsk = parseFloat(asks[0].price);
      const bestBid = parseFloat(bids[0].price);
      return (bestAsk - bestBid).toFixed(2);
    }
    return '-';
  }, [asks, bids]);

  return (
    <div className="orderbook">
      <div className="orderbook-title">Order Book</div>
      <div className="orderbook-header">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Total</span>
      </div>

      {asksWithCumulative.map((level, i) => (
        <div
          key={`ask-${i}`}
          className="orderbook-row"
          onClick={() => onPriceClick?.(level.price)}
        >
          <span className="price-ask">{level.price}</span>
          <span className="text-right">{level.quantity}</span>
          <span className="text-right text-secondary">{level.cumulative}</span>
        </div>
      ))}

      <div className="orderbook-spread">Spread: {spread}</div>

      {bidsWithCumulative.map((level, i) => (
        <div
          key={`bid-${i}`}
          className="orderbook-row"
          onClick={() => onPriceClick?.(level.price)}
        >
          <span className="price-bid">{level.price}</span>
          <span className="text-right">{level.quantity}</span>
          <span className="text-right text-secondary">{level.cumulative}</span>
        </div>
      ))}
    </div>
  );
}
