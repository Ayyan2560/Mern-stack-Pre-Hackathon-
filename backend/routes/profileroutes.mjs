import express from 'express';
import { updateProfile , 
        getProfile, 
        changePassword, 
        uploadProfilePicture, 
        removeProfilePicture,
       
        } from '../controllers/profileController.mjs';
import { protect } from '../middleware/authmiddleware.mjs';
import upload from '../middleware/uploadMiddleware.mjs';

const router = express.Router();

router.put('/', protect, updateProfile);

router.get('/', protect, getProfile);

router.patch('/change-password', protect, changePassword);

router.patch('/picture', protect, upload.single('profilePicture'),uploadProfilePicture );

router.delete('/picture', protect, removeProfilePicture);



export default router;
