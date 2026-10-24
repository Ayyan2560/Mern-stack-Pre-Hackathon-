import express from 'express';

import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  logout,
  verifyEmail,
  getMe,

} from '../controllers/authController.mjs';
 import { protect } from '../middleware/authmiddleware.mjs';

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);

router.post('/forgot-Password', forgotPassword);

router.post('/logout', logout);

router.get('/me', protect, getMe);
 
router.post('/reset-password', resetPassword);


router.post("/verify-email", verifyEmail);




export default router;