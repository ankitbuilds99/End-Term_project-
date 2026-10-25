import express from 'express';
import { getProfile, updateProfile, listArtists } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/artists', listArtists);
router.put('/profile', isAuthenticated, updateProfile);
router.get('/:identifier', getProfile);

export default router;
