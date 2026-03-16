import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import TradePage from './pages/TradePage';
import LoginPage from './pages/LoginPage';
import './styles/trading.css';

function App() {
  const [symbol, setSymbol] = useState('BTC-USDT');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/trade"
          element={
            localStorage.getItem('token') ? (
              <>
                <Header symbol={symbol} onSymbolChange={setSymbol} />
                <TradePage symbol={symbol} />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/trade" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
