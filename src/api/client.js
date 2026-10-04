import axios from 'axios';

const configuredUrl = import.meta.env.VITE_API_URL?.trim();

const api = axios.create({
  baseURL: configuredUrl ? `${configuredUrl.replace(/\/+$/, '')}/` : undefined,
});

api.interceptors.request.use((config) => {
  if (!configuredUrl) {
    throw new Error('The server connection is not configured. Please contact the site administrator.');
  }
  return config;
});

api.interceptors.response.use((response) => {
  if (typeof response.data === 'string') {
    throw new Error('The server returned an unexpected response. Please contact the site administrator.');
  }
  return response;
});

export default api;
