import { useState, useEffect, useRef } from 'react';
import client from '../api/client';

interface BalanceBarProps {
  symbol: string;
}

interface BalanceInfo {
  asset: string;
  available: string;
}

export default function BalanceBar({ symbol }: BalanceBarProps) {
  const [balances, setBalances] = useState<BalanceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const [base, quote] = symbol.split('-');

  useEffect(() => {
    mountedRef.current = true;

    const fetchBalances = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setBalances([
          { asset: base, available: '--' },
          { asset: quote, available: '--' },
        ]);
        return;
      }

      try {
        const res = await client.get('/account/balances');
        if (!mountedRef.current) return;
        const balanceList = res.data.balances ?? [];

        // Build lookup from array
        const lookup: Record<string, string> = {};
        for (const b of balanceList) {
          if (b.asset && b.available !== undefined) {
            lookup[b.asset] = b.available;
          }
        }

        setBalances([
          { asset: base, available: lookup[base] ?? '0' },
          { asset: quote, available: lookup[quote] ?? '0' },
        ]);
        setError(null);
      } catch {
        if (!mountedRef.current) return;
        setError('Unable to load balances');
        setBalances([
          { asset: base, available: '--' },
          { asset: quote, available: '--' },
        ]);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 5000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [base, quote]);

  return (
    <div className="balance-bar">
      <div className="balance-bar-title">Balances</div>
      {error && <div className="balance-bar-error">{error}</div>}
      <div className="balance-bar-items">
        {balances.map((b) => (
          <div key={b.asset} className="balance-bar-item">
            <span className="balance-asset">{b.asset}</span>
            <span className="balance-amount">{b.available}</span>
          </div>
        ))}
      </div>
      {balances.every(b => b.available === '0' || b.available === '--') && (
        <button
          onClick={async () => {
            try {
              await client.post('/faucet');
              setTimeout(() => window.location.reload(), 500);
            } catch {}
          }}
          style={{
            marginTop: 8,
            background: 'var(--yellow)',
            border: 'none',
            color: '#0b0e11',
            padding: '6px 16px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            width: '100%',
          }}
        >
          Get Testnet Funds
        </button>
      )}
    </div>
  );
}
