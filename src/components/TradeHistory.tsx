import { Side, type Trade } from '../types';

interface TradeHistoryProps {
  trades: Trade[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  return (
    <div className="trade-history">
      <div className="trade-history-title">Recent Trades</div>
      <div className="trade-history-header">
        <span>Price</span>
        <span className="text-right">Quantity</span>
        <span className="text-right">Side</span>
        <span className="text-right">Time</span>
      </div>
      {trades.map((trade) => (
        <div key={trade.id} className="trade-history-row">
          <span style={{ color: trade.maker_side === Side.Buy ? 'var(--red)' : 'var(--green)' }}>
            {trade.price}
          </span>
          <span className="text-right">{trade.quantity}</span>
          <span
            className="text-right"
            style={{ color: trade.maker_side === Side.Buy ? 'var(--red)' : 'var(--green)' }}
          >
            {trade.maker_side === Side.Buy ? 'SELL' : 'BUY'}
          </span>
          <span className="text-right text-secondary">
            {new Date(trade.created_at).toLocaleTimeString()}
          </span>
        </div>
      ))}
      {trades.length === 0 && (
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No recent trades
        </div>
      )}
    </div>
  );
}
