import express from 'express';
import { searchUsers, getUserById } from '../controllers/userController.mjs';
import { protect } from '../middleware/authmiddleware.mjs';

const router = express.Router();

// Search users (login required)
router.get('/search', protect, searchUsers);

// Get public profile by ID
router.get('/:userId', protect, getUserById);

export default router;