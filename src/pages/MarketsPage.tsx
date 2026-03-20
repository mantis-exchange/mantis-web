import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

interface SymbolInfo {
  symbol: string;
  base: string;
  quote: string;
  price: string;
  change_24h?: string;
  high_24h?: string;
  low_24h?: string;
  volume_24h?: string;
}

export default function MarketsPage() {
  const [symbols, setSymbols] = useState<SymbolInfo[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'symbol' | 'price'>('symbol');
  const [sortAsc, setSortAsc] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSymbols = () => {
      client.get('/symbols')
        .then((res) => setSymbols(res.data.symbols || []))
        .catch(() => {});
    };
    fetchSymbols();
    const interval = setInterval(fetchSymbols, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (key: 'symbol' | 'price') => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = symbols
    .filter((s) =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.base.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = sortKey === 'symbol'
        ? a.symbol.localeCompare(b.symbol)
        : parseFloat(a.price) - parseFloat(b.price);
      return sortAsc ? cmp : -cmp;
    });

  const arrow = (key: string) => sortKey === key ? (sortAsc ? ' ↑' : ' ↓') : '';

  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: 'var(--bg-secondary)' }}>
      {/* Title bar */}
      <div style={{ padding: '32px 48px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Markets Overview
          </h1>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{symbols.length} trading pairs available</span>
        </div>
        <input
          type="text"
          placeholder="Search coin name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 20px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 14,
            width: 300,
            outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ padding: '0 48px 48px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              {[
                { label: '#', align: 'left', key: null, w: undefined },
                { label: 'Name', align: 'left', key: 'symbol' },
                { label: 'Price', align: 'right', key: 'price' },
                { label: '24h Change', align: 'right', key: null },
                { label: '24h Volume', align: 'right', key: null },
                { label: 'Market', align: 'right', key: null },
                { label: '', align: 'center', key: null },
              ].map((col, i) => (
                <th
                  key={i}
                  onClick={col.key ? () => handleSort(col.key as 'symbol' | 'price') : undefined}
                  style={{
                    textAlign: col.align as 'left' | 'right' | 'center',
                    padding: '14px 16px',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: col.key ? 'pointer' : 'default',
                    userSelect: 'none',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {col.label}{col.key ? arrow(col.key) : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const change = s.change_24h || '0.00';
              const isPositive = parseFloat(change) >= 0;
              const volume = parseFloat(s.volume_24h || '0').toLocaleString(undefined, { maximumFractionDigits: 2 });

              return (
                <tr
                  key={s.symbol}
                  onClick={() => navigate(`/trade/${s.symbol}`)}
                  style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(43,49,57,0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13 }}>{i + 1}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: `hsl(${s.base.charCodeAt(0) * 15}, 55%, 45%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>
                        {s.base.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>{s.base}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px', fontFamily: "'SF Mono','Fira Code',monospace", color: 'var(--text-primary)', fontSize: 15, fontWeight: 500 }}>
                    ${parseFloat(s.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: 4,
                      background: isPositive ? 'rgba(14,203,129,0.12)' : 'rgba(246,70,93,0.12)',
                      color: isPositive ? 'var(--green)' : 'var(--red)',
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'SF Mono','Fira Code',monospace",
                    }}>
                      {isPositive ? '+' : ''}{change}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px', color: 'var(--text-secondary)', fontSize: 14, fontFamily: "'SF Mono','Fira Code',monospace" }}>
                    ${volume}
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px', color: 'var(--text-secondary)', fontSize: 13 }}>
                    Spot
                  </td>
                  <td style={{ textAlign: 'center', padding: '16px' }}>
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
                      }}
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
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
