import { useState, useCallback } from 'react';
import Chart from '../components/Chart';
import OrderBook from '../components/OrderBook';
import TradeForm from '../components/TradeForm';
import TradeHistory from '../components/TradeHistory';
import BalanceBar from '../components/BalanceBar';
import { useOrderBook } from '../hooks/useOrderBook';
import { useTradeHistory } from '../hooks/useTradeHistory';

interface TradePageProps {
  symbol: string;
}

export default function TradePage({ symbol }: TradePageProps) {
  const { bids, asks } = useOrderBook(symbol);
  const { trades } = useTradeHistory(symbol);
  const [selectedPrice, setSelectedPrice] = useState('');

  const handlePriceClick = useCallback((price: string) => {
    setSelectedPrice(price);
  }, []);

  return (
    <div className="trading-page">
      <div className="chart-area">
        <Chart symbol={symbol} />
      </div>
      <div className="orderbook-area">
        <OrderBook bids={bids} asks={asks} onPriceClick={handlePriceClick} />
      </div>
      <div className="trade-form-area">
        <BalanceBar symbol={symbol} />
        <TradeForm symbol={symbol} defaultPrice={selectedPrice} />
      </div>
      <div className="trade-history-area">
        <TradeHistory trades={trades} />
      </div>
    </div>
  );
}
