import express from 'express';
import { createPost , getAllPosts,   getPostById ,  updatePost,} from '../controllers/postController.mjs';
import { protect } from '../middleware/authmiddleware.mjs';
import upload from '../middleware/uploadMiddleware.mjs';

const router = express.Router();
router.get('/', getAllPosts);

router.patch('/:id', protect, updatePost);

router.get('/:id', getPostById);

router.post( '/',protect,upload.array('images', 5),createPost);

export default router;
