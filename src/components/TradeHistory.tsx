import { Side, type Trade } from '../types';

function exportCSV(trades: Trade[]) {
  const header = 'ID,Symbol,Price,Quantity,Side,Time\n';
  const rows = trades.map(t =>
    `${t.id},${t.symbol},${t.price},${t.quantity},${t.maker_side},${new Date(t.created_at).toISOString()}`
  ).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mantis-trades-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface TradeHistoryProps {
  trades: Trade[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  return (
    <div className="trade-history">
      <div className="trade-history-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Recent Trades</span>
        {trades.length > 0 && (
          <button
            onClick={() => exportCSV(trades)}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '2px 8px',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Export CSV
          </button>
        )}
      </div>
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
