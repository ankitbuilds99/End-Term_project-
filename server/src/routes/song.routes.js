import express from 'express';
import {
  getSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  getMyTracks,
  recordPlayEvent,
} from '../controllers/song.controller.js';
import { isAuthenticated, requireRole, optionalAuth } from '../middlewares/auth.middleware.js';
import { uploadMedia } from '../utils/upload.js';

const router = express.Router();

// Public / Catalogue routes
router.get('/', getSongs);
router.get('/artist/my-tracks', isAuthenticated, requireRole('artist', 'admin'), getMyTracks);
router.get('/:id', optionalAuth, getSongById);

// Artist management routes
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

// Play event tracking
router.post('/:id/play', optionalAuth, recordPlayEvent);

export default router;
