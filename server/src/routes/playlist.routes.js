import express from 'express';
import {
  createPlaylist,
  getPlaylists,
  getMyPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylistTracks,
} from '../controllers/playlist.controller.js';
import { isAuthenticated, optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public playlist discovery
router.get('/', getPlaylists);

// Authenticated user playlists (must precede /:id)
router.get('/my-playlists', isAuthenticated, getMyPlaylists);

// Playlist CRUD
router.post('/', isAuthenticated, createPlaylist);
router.get('/:id', optionalAuth, getPlaylistById);
router.put('/:id', isAuthenticated, updatePlaylist);
router.delete('/:id', isAuthenticated, deletePlaylist);

// Playlist track management
router.post('/:id/songs', isAuthenticated, addSongToPlaylist);
router.delete('/:id/songs/:songId', isAuthenticated, removeSongFromPlaylist);
router.put('/:id/reorder', isAuthenticated, reorderPlaylistTracks);

export default router;
