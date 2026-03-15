export const Side = {
  Buy: 'BUY',
  Sell: 'SELL',
} as const;
export type Side = (typeof Side)[keyof typeof Side];

export const OrderType = {
  Limit: 'LIMIT',
  Market: 'MARKET',
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export const OrderStatus = {
  New: 'NEW',
  PartiallyFilled: 'PARTIALLY_FILLED',
  Filled: 'FILLED',
  Cancelled: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface Order {
  id: string;
  symbol: string;
  side: Side;
  order_type: OrderType;
  price: string;
  quantity: string;
  filled_quantity: string;
  status: OrderStatus;
  created_at: number;
}

export interface Trade {
  id: string;
  symbol: string;
  price: string;
  quantity: string;
  maker_side: Side;
  created_at: number;
}

export interface DepthLevel {
  price: string;
  quantity: string;
}

export interface OrderBookDepth {
  symbol: string;
  bids: DepthLevel[];
  asks: DepthLevel[];
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}
