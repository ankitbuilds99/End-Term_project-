import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8008';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to resolve audio and artwork URLs (handles relative /uploads/ and external http)
export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Authentication endpoints
export const registerApi = (data) => api.post('/auth/register', data);
export const loginApi = (data) => api.post('/auth/login', data);
export const getMeApi = () => api.get('/auth/me');
export const logoutApi = () => api.post('/auth/logout');

// User & Artist endpoints
export const getProfileApi = (identifier) => api.get(`/users/${identifier}`);
export const updateProfileApi = (data) => api.put('/users/profile', data);
export const listArtistsApi = (params = {}) => api.get('/users/artists', { params });

// Song Catalogue & Playback endpoints
export const getSongsApi = (params = {}) => api.get('/songs', { params });
export const getSongByIdApi = (id) => api.get(`/songs/${id}`);
export const getMyTracksApi = () => api.get('/songs/artist/my-tracks');
export const createSongApi = (formData) =>
  api.post('/songs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateSongApi = (id, formData) =>
  api.put(`/songs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteSongApi = (id) => api.delete(`/songs/${id}`);
export const recordPlayApi = (id, data) => api.post(`/songs/${id}/play`, data);

// System Health
export const getHealthApi = () => api.get('/health');

export default api;
