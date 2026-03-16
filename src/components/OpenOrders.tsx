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

interface OpenOrdersProps {
  orders: OrderItem[];
  onCancel: () => void;
}

function formatSide(s: string): string {
  return s.replace('SIDE_', '');
}

function formatStatus(s: string): string {
  return s.replace('ORDER_STATUS_', '').replace('_', ' ');
}

function formatType(t: string): string {
  return t.replace('ORDER_TYPE_', '');
}

export default function OpenOrders({ orders, onCancel }: OpenOrdersProps) {
  const handleCancel = async (orderId: string, symbol: string) => {
    try {
      await client.delete(`/orders/${orderId}?symbol=${symbol}`);
      onCancel();
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  const activeOrders = orders.filter(
    (o) => o.status === 'ORDER_STATUS_NEW' || o.status === 'ORDER_STATUS_PARTIALLY_FILLED'
  );

  const filledOrders = orders.filter(
    (o) => o.status === 'ORDER_STATUS_FILLED' || o.status === 'ORDER_STATUS_CANCELLED'
  );

  return (
    <div className="open-orders">
      <div className="open-orders-title">Open Orders ({activeOrders.length})</div>
      <div className="orderbook-header" style={{ gridTemplateColumns: '0.8fr 0.6fr 0.6fr 0.8fr 0.8fr 0.8fr 0.6fr 0.8fr' }}>
        <span>Side</span>
        <span>Type</span>
        <span>Price</span>
        <span>Qty</span>
        <span>Filled</span>
        <span>Status</span>
        <span>Time</span>
        <span></span>
      </div>
      {activeOrders.length === 0 ? (
        <div style={{ padding: '12px 0', color: 'var(--text-secondary)', fontSize: 12, textAlign: 'center' }}>
          No open orders
        </div>
      ) : (
        activeOrders.map((o) => (
          <div
            key={o.id}
            className="orderbook-row"
            style={{ gridTemplateColumns: '0.8fr 0.6fr 0.6fr 0.8fr 0.8fr 0.8fr 0.6fr 0.8fr', fontSize: 12 }}
          >
            <span style={{ color: o.side.includes('BUY') ? 'var(--green)' : 'var(--red)' }}>
              {formatSide(o.side)}
            </span>
            <span>{formatType(o.type)}</span>
            <span>{o.price || '-'}</span>
            <span>{o.quantity}</span>
            <span>{o.filled_quantity}</span>
            <span style={{ color: 'var(--yellow)' }}>{formatStatus(o.status)}</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {new Date(o.created_at).toLocaleTimeString()}
            </span>
            <span>
              <button
                onClick={() => handleCancel(o.id, o.symbol)}
                style={{
                  background: 'none',
                  border: '1px solid var(--red)',
                  color: 'var(--red)',
                  padding: '2px 8px',
                  borderRadius: 3,
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                Cancel
              </button>
            </span>
          </div>
        ))
      )}

      {filledOrders.length > 0 && (
        <>
          <div className="open-orders-title" style={{ marginTop: 12 }}>Order History</div>
          {filledOrders.slice(0, 10).map((o) => (
            <div
              key={o.id}
              className="orderbook-row"
              style={{ gridTemplateColumns: '0.8fr 0.6fr 0.6fr 0.8fr 0.8fr 0.8fr 0.6fr 0.8fr', fontSize: 12 }}
            >
              <span style={{ color: o.side.includes('BUY') ? 'var(--green)' : 'var(--red)' }}>
                {formatSide(o.side)}
              </span>
              <span>{formatType(o.type)}</span>
              <span>{o.price || '-'}</span>
              <span>{o.quantity}</span>
              <span>{o.filled_quantity}</span>
              <span style={{ color: o.status.includes('FILLED') ? 'var(--green)' : 'var(--text-secondary)' }}>
                {formatStatus(o.status)}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {new Date(o.created_at).toLocaleTimeString()}
              </span>
              <span></span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
