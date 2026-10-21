import express from 'express';

import { updateProfile } from '../controllers/profileController.mjs';
import { protect } from '../middleware/authmiddleware.mjs';

const router = express.Router();

router.put('/', protect, updateProfile);

export default router;
