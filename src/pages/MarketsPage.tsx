import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

interface SymbolInfo {
  symbol: string;
  base: string;
  quote: string;
  price: string;
}

export default function MarketsPage() {
  const [symbols, setSymbols] = useState<SymbolInfo[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    client.get('/symbols')
      .then((res) => setSymbols(res.data.symbols || []))
      .catch(() => {});
  }, []);

  const filtered = symbols.filter((s) =>
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    s.base.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--yellow)' }}>Markets</h1>
        <input
          type="text"
          placeholder="Search pairs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 16px',
            border: '1px solid var(--border)',
            borderRadius: 4,
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 14,
            width: 240,
            outline: 'none',
          }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>Pair</th>
            <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>Last Price</th>
            <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>Quote</th>
            <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr
              key={s.symbol}
              onClick={() => navigate(`/trade/${s.symbol}`)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-primary)' }}>{s.base}</span>
                <span style={{ color: 'var(--text-secondary)' }}> / {s.quote}</span>
              </td>
              <td style={{ textAlign: 'right', padding: '12px 8px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                {s.price}
              </td>
              <td style={{ textAlign: 'right', padding: '12px 8px', color: 'var(--text-secondary)' }}>
                {s.quote}
              </td>
              <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                <button
                  style={{
                    background: 'var(--yellow)',
                    border: 'none',
                    color: '#0b0e11',
                    padding: '6px 16px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Trade
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
                No pairs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
