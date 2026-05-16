import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Notification Endpoints ──────────────────────────────────────
export const fetchPriorityInbox = (n = 10) =>
  api.get(`/api/notifications/priority-inbox?n=${n}`);

export const fetchHealth = () =>
  api.get('/api/health');

// ── Setup / Auth Endpoints ──────────────────────────────────────
export const registerUser = (payload) =>
  api.post('/api/setup/register', payload);

export const authenticateUser = (payload) =>
  api.post('/api/setup/auth', payload);

export default api;
