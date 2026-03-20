import { useState, useEffect } from 'react';

export default function WsIndicator() {
  const [connected, setConnected] = useState(false);
  const [showReconnecting, setShowReconnecting] = useState(false);

  useEffect(() => {
    const onConnect = () => { setConnected(true); setShowReconnecting(false); };
    const onDisconnect = () => { setConnected(false); setShowReconnecting(true); };

    window.addEventListener('mantis:ws-connected', onConnect);
    window.addEventListener('mantis:ws-disconnected', onDisconnect);

    return () => {
      window.removeEventListener('mantis:ws-connected', onConnect);
      window.removeEventListener('mantis:ws-disconnected', onDisconnect);
    };
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: connected ? 'var(--green)' : 'var(--red)',
      }} />
      {showReconnecting && !connected && (
        <span style={{ color: 'var(--red)', fontSize: 10 }}>Reconnecting...</span>
      )}
    </div>
  );
}
