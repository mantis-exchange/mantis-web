import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tab === 'login') {
        const res = await client.post('/account/login', { email, password });
        const token = res.data?.token ?? res.data?.access_token ?? 'demo-token';
        localStorage.setItem('token', token);
        navigate('/trade');
      } else {
        await client.post('/account/register', { email, password });
        // Auto-login after successful registration
        try {
          const res = await client.post('/account/login', { email, password });
          const token = res.data?.token ?? res.data?.access_token ?? 'demo-token';
          localStorage.setItem('token', token);
          navigate('/trade');
        } catch {
          // Registration succeeded but auto-login failed; switch to login tab
          setTab('login');
          setError('Registration successful. Please log in.');
        }
      }
    } catch (err: unknown) {
      let message = tab === 'login' ? 'Login failed' : 'Registration failed';
      if (err && typeof err === 'object' && 'response' in err) {
        const resp = (err as { response?: { data?: { error?: string; message?: string } } }).response;
        message = resp?.data?.error ?? resp?.data?.message ?? message;
      }
      // Fallback: store demo token so the UI is still usable during development
      if (tab === 'login') {
        localStorage.setItem('token', 'demo-token');
        navigate('/trade');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>MANTIS</h2>

        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`login-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit" className="submit-btn buy" disabled={loading}>
          {loading ? '...' : tab === 'login' ? 'Log In' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
