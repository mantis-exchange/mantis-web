import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import TradePage from './pages/TradePage';
import LoginPage from './pages/LoginPage';
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

function App() {
  const [symbol, setSymbol] = useState('BTC-USDT');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/trade"
          element={
            <AuthGuard>
              <Header symbol={symbol} onSymbolChange={setSymbol} />
              <TradePage symbol={symbol} />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/trade" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
