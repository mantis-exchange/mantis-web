// Price decimal places per symbol
const PRICE_PRECISION: Record<string, number> = {
  'BTC-USDT': 2,
  'ETH-USDT': 2,
  'BNB-USDT': 2,
  'SOL-USDT': 2,
  'LTC-USDT': 2,
  'AVAX-USDT': 2,
  'DOT-USDT': 2,
  'LINK-USDT': 2,
  'UNI-USDT': 2,
  'ATOM-USDT': 2,
  'APT-USDT': 2,
  'FIL-USDT': 2,
  'NEAR-USDT': 2,
  'OP-USDT': 3,
  'ARB-USDT': 4,
  'QFC-USDT': 4,
  'XRP-USDT': 4,
  'ADA-USDT': 4,
  'MATIC-USDT': 4,
  'DOGE-USDT': 5,
};

const QTY_PRECISION: Record<string, number> = {
  'BTC-USDT': 6,
  'ETH-USDT': 4,
  'DOGE-USDT': 0,
  'XRP-USDT': 0,
  'ADA-USDT': 0,
  'MATIC-USDT': 0,
};

export function pricePrecision(symbol: string): number {
  return PRICE_PRECISION[symbol] ?? 2;
}

export function qtyPrecision(symbol: string): number {
  return QTY_PRECISION[symbol] ?? 4;
}

export function formatPrice(price: string | number, symbol: string): string {
  const p = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(p)) return '0';
  return p.toFixed(pricePrecision(symbol));
}

export function formatQty(qty: string | number, symbol: string): string {
  const q = typeof qty === 'string' ? parseFloat(qty) : qty;
  if (isNaN(q)) return '0';
  return q.toFixed(qtyPrecision(symbol));
}
