import axios from 'axios';

function getApiBase(): string {
  if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE;
  // In production, API is on a sibling subdomain (cex-api.*)
  const host = window.location.hostname;
  if (host.startsWith('cex.')) {
    return `${window.location.protocol}//cex-api.${host.slice(4)}/api/v1`;
  }
  return '/api/v1';
}
const API_BASE = getApiBase();

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
