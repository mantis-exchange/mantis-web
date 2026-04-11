# mantis-web

Web trading interface for [Mantis Exchange](https://github.com/mantis-exchange). Dark-themed, real-time trading UI inspired by Binance.

## Features

- **Candlestick chart** — TradingView lightweight-charts
- **Order book** — real-time bid/ask depth with spread display
- **Trade form** — limit/market orders, buy/sell, price click from order book
- **Trade history** — recent trades with real-time updates
- **Balance bar** — available balances for base/quote assets
- **WebSocket** — real-time market data streaming
- **Login/Register** — JWT authentication

## Tech Stack

- React 19 + TypeScript
- Vite
- lightweight-charts (TradingView)
- axios + react-router-dom

## Quick Start

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # Production build
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE` | `http://localhost:8080/api/v1` | Gateway REST API |
| `VITE_WS_URL` | `ws://localhost:8080/ws` | Gateway WebSocket |

## Part of [Mantis Exchange](https://github.com/mantis-exchange)

MIT License
