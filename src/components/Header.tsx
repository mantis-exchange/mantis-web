import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
}

export default function Header({ symbol }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          className="header-logo"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/markets')}
        >
          MANTIS
        </div>
        <button
          onClick={() => navigate('/markets')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Markets
        </button>
        {symbol && (
          <span style={{ color: 'var(--yellow)', fontWeight: 700, fontSize: '16px' }}>
            {symbol}
          </span>
        )}
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
