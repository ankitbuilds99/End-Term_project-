import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8008/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication endpoints
export const registerApi = (data) => api.post('/auth/register', data);
export const loginApi = (data) => api.post('/auth/login', data);
export const getMeApi = () => api.get('/auth/me');
export const logoutApi = () => api.post('/auth/logout');

// User & Artist endpoints
export const getProfileApi = (identifier) => api.get(`/users/${identifier}`);
export const updateProfileApi = (data) => api.put('/users/profile', data);
export const listArtistsApi = (params = {}) => api.get('/users/artists', { params });

// System Health
export const getHealthApi = () => api.get('/health');

export default api;
