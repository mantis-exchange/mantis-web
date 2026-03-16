import { useEffect, useRef, useCallback, useState } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

interface WsMessage {
  channel: string;
  symbol: string;
  data: unknown;
}

interface Subscription {
  channel: string;
  symbol: string;
}

type MessageHandler = (msg: WsMessage) => void;

// Singleton WebSocket connection shared across all hooks
let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const handlers = new Set<MessageHandler>();
const activeSubscriptions = new Set<string>();
let connectedState = false;
const connectedListeners = new Set<(v: boolean) => void>();

function notifyConnected(v: boolean) {
  connectedState = v;
  connectedListeners.forEach((fn) => fn(v));
}

function getOrCreateWs(): WebSocket {
  if (ws && ws.readyState <= WebSocket.OPEN) return ws;

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    notifyConnected(true);
    // Re-subscribe all active subscriptions
    activeSubscriptions.forEach((key) => {
      const [channel, symbol] = key.split(':');
      ws?.send(JSON.stringify({ action: 'subscribe', channel, symbol }));
    });
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Skip ack messages
      if (data.action) return;
      handlers.forEach((fn) => fn(data as WsMessage));
    } catch {
      // ignore
    }
  };

  ws.onclose = () => {
    notifyConnected(false);
    ws = null;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => getOrCreateWs(), 3000);
  };

  ws.onerror = () => {
    ws?.close();
  };

  return ws;
}

export function useWebSocket(
  subscriptions: Subscription[],
  onMessage: MessageHandler,
) {
  const [connected, setConnected] = useState(connectedState);
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  // Stable handler wrapper
  const stableHandler = useCallback((msg: WsMessage) => {
    handlerRef.current(msg);
  }, []);

  // Serialize subscriptions into a stable string for the dependency array
  const subsKey = subscriptions.map((s) => `${s.channel}:${s.symbol}`).join(',');

  useEffect(() => {
    // Register handler
    handlers.add(stableHandler);
    connectedListeners.add(setConnected);

    // Ensure WS is connected
    const socket = getOrCreateWs();

    // Subscribe to channels
    const keys: string[] = [];
    for (const sub of subscriptions) {
      const key = `${sub.channel}:${sub.symbol}`;
      keys.push(key);
      if (!activeSubscriptions.has(key)) {
        activeSubscriptions.add(key);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              action: 'subscribe',
              channel: sub.channel,
              symbol: sub.symbol,
            }),
          );
        }
      }
    }

    return () => {
      handlers.delete(stableHandler);
      connectedListeners.delete(setConnected);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subsKey, stableHandler]);

  return { connected };
}
