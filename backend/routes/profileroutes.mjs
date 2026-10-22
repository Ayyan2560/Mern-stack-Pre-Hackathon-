import express from 'express';
import { updateProfile ,  getProfile, changePassword,} from '../controllers/profileController.mjs';
import { protect } from '../middleware/authmiddleware.mjs';

const router = express.Router();

router.put('/', protect, updateProfile);

router.get('/', protect, getProfile);

router.patch('/change-password', protect, changePassword);

export default router;
