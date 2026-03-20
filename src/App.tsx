import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from './components/Header';
import TradePage from './pages/TradePage';
import LoginPage from './pages/LoginPage';
import MarketsPage from './pages/MarketsPage';
import './styles/trading.css';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { replace: true });
    }
    setChecked(true);
  }, [navigate, location]);

  if (!checked) return null;
  if (!localStorage.getItem('token')) return null;
  return <>{children}</>;
}

function TradeRoute() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const activeSymbol = symbol || 'BTC-USDT';

  return (
    <>
      <Header
        symbol={activeSymbol}
        onSymbolChange={(s) => navigate(`/trade/${s}`)}
      />
      <TradePage symbol={activeSymbol} />
    </>
  );
}

function App() {
  // Initialize theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/markets" element={
          <AuthGuard>
            <Header symbol="" onSymbolChange={() => {}} />
            <MarketsPage />
          </AuthGuard>
        } />
        <Route path="/trade/:symbol" element={
          <AuthGuard>
            <TradeRoute />
          </AuthGuard>
        } />
        <Route path="/trade" element={<Navigate to="/markets" replace />} />
        <Route path="*" element={<Navigate to="/markets" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
