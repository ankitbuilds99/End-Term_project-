import express from 'express';
import {
  getSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  getMyTracks,
  recordPlayEvent,
  getPersonalizedDiscovery,
} from '../controllers/song.controller.js';
import {
  toggleLike,
  getLikedSongs,
  getLikedSongIds,
} from '../controllers/like.controller.js';
import { isAuthenticated, requireRole, optionalAuth } from '../middlewares/auth.middleware.js';
import { uploadMedia } from '../utils/upload.js';

const router = express.Router();

// Catalogue & Discovery routes
router.get('/', getSongs);
router.get('/discovery/personalized', optionalAuth, getPersonalizedDiscovery);
router.get('/artist/my-tracks', isAuthenticated, requireRole('artist', 'admin'), getMyTracks);

// User Liked Songs routes (must precede /:id)
router.get('/user/liked', isAuthenticated, getLikedSongs);
router.get('/user/liked-ids', isAuthenticated, getLikedSongIds);

// Individual Song Details
router.get('/:id', optionalAuth, getSongById);

// Like / Unlike toggle
router.post('/:id/like', isAuthenticated, toggleLike);

// Play event tracking
router.post('/:id/play', optionalAuth, recordPlayEvent);

// Artist song management routes
router.post(
  '/',
  isAuthenticated,
  requireRole('artist', 'admin'),
  uploadMedia.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'artwork', maxCount: 1 },
  ]),
  createSong
);

router.put(
  '/:id',
  isAuthenticated,
  requireRole('artist', 'admin'),
  uploadMedia.fields([{ name: 'artwork', maxCount: 1 }]),
  updateSong
);

router.delete('/:id', isAuthenticated, requireRole('artist', 'admin'), deleteSong);

export default router;
