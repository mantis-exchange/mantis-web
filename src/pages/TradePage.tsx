import { useState, useCallback } from 'react';
import Chart from '../components/Chart';
import OrderBook from '../components/OrderBook';
import TradeForm from '../components/TradeForm';
import TradeHistory from '../components/TradeHistory';
import type { DepthLevel, Trade } from '../types';

// Mock depth data — will be replaced with API/WebSocket data
const mockAsks: DepthLevel[] = [
  { price: '50100.00', quantity: '0.3000' },
  { price: '50150.00', quantity: '1.2000' },
  { price: '50200.00', quantity: '2.0000' },
  { price: '50250.00', quantity: '0.8000' },
  { price: '50300.00', quantity: '1.5000' },
];

const mockBids: DepthLevel[] = [
  { price: '50000.00', quantity: '1.0000' },
  { price: '49950.00', quantity: '0.5000' },
  { price: '49900.00', quantity: '2.5000' },
  { price: '49850.00', quantity: '1.1000' },
  { price: '49800.00', quantity: '3.0000' },
];

interface TradePageProps {
  symbol: string;
}

export default function TradePage({ symbol }: TradePageProps) {
  const [trades] = useState<Trade[]>([]);

  const handlePriceClick = useCallback((_price: string) => {
    // TODO: set price in trade form
  }, []);

  return (
    <div className="trading-page">
      <div className="chart-area">
        <Chart symbol={symbol} />
      </div>
      <div className="orderbook-area">
        <OrderBook bids={mockBids} asks={mockAsks} onPriceClick={handlePriceClick} />
      </div>
      <div className="trade-form-area">
        <TradeForm symbol={symbol} />
      </div>
      <div className="trade-history-area">
        <TradeHistory trades={trades} />
      </div>
    </div>
  );
}
