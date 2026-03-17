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
  const [sortKey, setSortKey] = useState<'symbol' | 'price'>('symbol');
  const [sortAsc, setSortAsc] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    client.get('/symbols')
      .then((res) => setSymbols(res.data.symbols || []))
      .catch(() => {});
  }, []);

  const handleSort = (key: 'symbol' | 'price') => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filtered = symbols
    .filter((s) =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.base.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'symbol') cmp = a.symbol.localeCompare(b.symbol);
      else cmp = parseFloat(a.price) - parseFloat(b.price);
      return sortAsc ? cmp : -cmp;
    });

  const thStyle = {
    textAlign: 'left' as const,
    padding: '14px 16px',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    userSelect: 'none' as const,
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Markets Overview</h1>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{symbols.length} trading pairs</span>
        </div>
        <input
          type="text"
          placeholder="Search coin name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 16px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 14,
            width: 280,
            outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              <th style={{ ...thStyle, width: '5%' }}>#</th>
              <th style={thStyle} onClick={() => handleSort('symbol')}>
                Name {sortKey === 'symbol' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('price')}>
                Price {sortKey === 'price' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th style={{ ...thStyle, textAlign: 'right' }}>24h Change</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Market</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '12%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              // Simulate 24h change from price for display
              const change = ((Math.sin(s.base.charCodeAt(0) * 13.7) * 8)).toFixed(2);
              const isPositive = parseFloat(change) >= 0;

              return (
                <tr
                  key={s.symbol}
                  onClick={() => navigate(`/trade/${s.symbol}`)}
                  style={{
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(43,49,57,0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: `hsl(${s.base.charCodeAt(0) * 15}, 60%, 45%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: 'white',
                      }}>
                        {s.base.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{s.base}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '14px 16px', fontFamily: "'SF Mono','Fira Code',monospace", color: 'var(--text-primary)', fontSize: 14, fontWeight: 500 }}>
                    ${parseFloat(s.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td style={{ textAlign: 'right', padding: '14px 16px' }}>
                    <span style={{
                      color: isPositive ? 'var(--green)' : 'var(--red)',
                      fontSize: 14,
                      fontWeight: 500,
                      fontFamily: "'SF Mono','Fira Code',monospace",
                    }}>
                      {isPositive ? '+' : ''}{change}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>
                    Spot
                  </td>
                  <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                    <button
                      style={{
                        background: 'var(--yellow)',
                        border: 'none',
                        color: '#0b0e11',
                        padding: '8px 24px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No pairs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
