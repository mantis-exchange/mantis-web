import { useState, useCallback } from 'react';
import Chart from '../components/Chart';
import OrderBook from '../components/OrderBook';
import TradeForm from '../components/TradeForm';
import TradeHistory from '../components/TradeHistory';
import BalanceBar from '../components/BalanceBar';
import OpenOrders from '../components/OpenOrders';
import { useOrderBook } from '../hooks/useOrderBook';
import { useTradeHistory } from '../hooks/useTradeHistory';
import { useKlines } from '../hooks/useKlines';
import { useOrders } from '../hooks/useOrders';

interface TradePageProps {
  symbol: string;
}

export default function TradePage({ symbol }: TradePageProps) {
  const [interval, setInterval] = useState('1m');
  const { bids, asks } = useOrderBook(symbol);
  const { trades } = useTradeHistory(symbol);
  const { candles } = useKlines(symbol, interval);
  const { orders, refresh: refreshOrders } = useOrders(symbol);
  const [selectedPrice, setSelectedPrice] = useState('');

  const handlePriceClick = useCallback((price: string) => {
    setSelectedPrice(price);
  }, []);

  return (
    <div className="trading-page">
      <div className="chart-area">
        <Chart symbol={symbol} candles={candles} interval={interval} onIntervalChange={setInterval} />
      </div>
      <div className="orderbook-area">
        <OrderBook bids={bids} asks={asks} onPriceClick={handlePriceClick} />
      </div>
      <div className="trade-form-area">
        <BalanceBar symbol={symbol} />
        <TradeForm symbol={symbol} defaultPrice={selectedPrice} />
      </div>
      <div className="open-orders-area">
        <OpenOrders orders={orders} onCancel={refreshOrders} />
      </div>
      <div className="trade-history-area">
        <TradeHistory trades={trades} />
      </div>
    </div>
  );
}
