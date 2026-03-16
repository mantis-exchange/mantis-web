import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
}

const symbols = ['BTC-USDT', 'ETH-USDT'];

export default function Header({ symbol, onSymbolChange }: HeaderProps) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="header">
      <div className="header-logo">MANTIS</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {symbols.map((s) => (
          <button
            key={s}
            className="header-symbol"
            onClick={() => onSymbolChange(s)}
            style={{
              background: 'none',
              border: 'none',
              color: s === symbol ? 'var(--yellow)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: s === symbol ? 700 : 400,
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Testnet</div>
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            padding: '4px 12px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
