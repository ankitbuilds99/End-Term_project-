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

// Artist Follow endpoints
export const toggleFollowApi = (artistId) => api.post(`/users/${artistId}/follow`);
export const getFollowStatusApi = (artistId) => api.get(`/users/${artistId}/is-following`);
export const getMyFollowedArtistsApi = () => api.get('/users/me/following');

// Song Catalogue & Playback endpoints
export const getSongsApi = (params = {}) => api.get('/songs', { params });
export const getSongByIdApi = (id) => api.get(`/songs/${id}`);
export const getMyTracksApi = () => api.get('/songs/artist/my-tracks');
export const getArtistAnalyticsApi = (params = {}) => api.get('/songs/artist/analytics', { params });
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

// Song Likes endpoints
export const toggleLikeApi = (songId) => api.post(`/songs/${songId}/like`);
export const getLikedSongsApi = (params = {}) => api.get('/songs/user/liked', { params });
export const getLikedSongIdsApi = () => api.get('/songs/user/liked-ids');

// Personalized Discovery endpoint
export const getPersonalizedDiscoveryApi = (params = {}) =>
  api.get('/songs/discovery/personalized', { params });

// Playlists endpoints
export const createPlaylistApi = (data) => api.post('/playlists', data);
export const getPlaylistsApi = (params = {}) => api.get('/playlists', { params });
export const getMyPlaylistsApi = () => api.get('/playlists/my-playlists');
export const getPlaylistByIdApi = (id) => api.get(`/playlists/${id}`);
export const updatePlaylistApi = (id, data) => api.put(`/playlists/${id}`, data);
export const deletePlaylistApi = (id) => api.delete(`/playlists/${id}`);
export const addSongToPlaylistApi = (playlistId, songId) =>
  api.post(`/playlists/${playlistId}/songs`, { songId });
export const removeSongFromPlaylistApi = (playlistId, songId) =>
  api.delete(`/playlists/${playlistId}/songs/${songId}`);
export const reorderPlaylistTracksApi = (playlistId, songIds) =>
  api.put(`/playlists/${playlistId}/reorder`, { songIds });

// Listening History endpoints
export const getListeningHistoryApi = (params = {}) => api.get('/users/me/history', { params });
export const clearListeningHistoryApi = () => api.delete('/users/me/history');

// System Health
export const getHealthApi = () => api.get('/health');
export const checkHealth = getHealthApi;
export const getArtistsApi = listArtistsApi;

export default api;
