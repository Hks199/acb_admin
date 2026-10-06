import axios from 'axios';
import { getAdminToken, clearAdminSession } from '../lib/adminAuth';

const configuredUrl = import.meta.env.VITE_API_URL?.trim();

const api = axios.create({
  baseURL: configuredUrl ? `${configuredUrl.replace(/\/+$/, '')}/` : undefined,
});

api.interceptors.request.use((config) => {
  if (!configuredUrl) {
    throw new Error('The server connection is not configured. Please contact the site administrator.');
  }
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => {
  if (typeof response.data === 'string') {
    throw new Error('The server returned an unexpected response. Please contact the site administrator.');
  }
  return response;
}, (error) => {
  if (getAdminToken() && (error.response?.status === 401 || error.response?.data?.errorType === 'InvalidToken')) {
    clearAdminSession();
    window.dispatchEvent(new Event('admin-session-expired'));
  }
  return Promise.reject(error);
});

export default api;
