import express from 'express';
import {
  getProfile,
  updateProfile,
  listArtists,
  getListeningHistory,
  clearListeningHistory,
} from '../controllers/user.controller.js';
import {
  toggleFollow,
  getFollowStatus,
  getMyFollowedArtists,
} from '../controllers/follow.controller.js';
import { isAuthenticated, optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public artist directory
router.get('/artists', listArtists);

// User profile management
router.put('/profile', isAuthenticated, updateProfile);

// User personalized feeds: history & following
router.get('/me/history', isAuthenticated, getListeningHistory);
router.delete('/me/history', isAuthenticated, clearListeningHistory);
router.get('/me/following', isAuthenticated, getMyFollowedArtists);

// Artist follow actions
router.post('/:artistId/follow', isAuthenticated, toggleFollow);
router.get('/:artistId/is-following', optionalAuth, getFollowStatus);

// Profile lookup by ID or username (must remain at the bottom)
router.get('/:identifier', getProfile);

export default router;
