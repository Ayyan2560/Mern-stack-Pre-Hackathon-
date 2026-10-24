import axios from 'axios';
import { TOKEN_KEY, SESSION_EXPIRED_EVENT } from '../utils/constants.js';

const configuredBase =
  import.meta.env.VITE_API_URL || 'https://mern-stack-pre-hackathon-ptnt.vercel.app/api';

export const API_BASE_URL = configuredBase.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let lastSessionNoticeAt = 0;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isCredentialRequest = /^\/auth\/(login|signup|forgot-Password|reset-password|verify-email)/.test(
      url
    );

    if (status === 401 && !isCredentialRequest) {
      const now = Date.now();

      if (now - lastSessionNoticeAt > 2500) {
        lastSessionNoticeAt = now;
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
