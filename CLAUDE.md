# mantis-web

Mantis Exchange web trading interface.

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- lightweight-charts (TradingView candlestick charts)
- axios (HTTP client)
- react-router-dom (routing)

## Project Structure

```
src/
├── api/client.ts           # Axios instance → gateway API
├── components/
│   ├── Header.tsx           # Top nav, symbol selector
│   ├── OrderBook.tsx        # Bid/ask depth display
│   ├── TradeForm.tsx        # Buy/sell order form
│   ├── TradeHistory.tsx     # Recent trades
│   └── Chart.tsx            # Candlestick chart
├── pages/
│   ├── TradePage.tsx        # Main trading layout
│   └── LoginPage.tsx        # Login
├── hooks/useWebSocket.ts    # WebSocket for real-time data
├── types/index.ts           # TypeScript types
└── styles/trading.css       # Dark theme styles
```

## Development

```bash
npm install
npm run dev      # Dev server on http://localhost:5173
npm run build    # Production build
```

## Environment Variables

- `VITE_API_BASE` — Gateway REST API base URL (default: `http://localhost:8080/api/v1`)
- `VITE_WS_URL` — Gateway WebSocket URL (default: `ws://localhost:8080/ws`)
