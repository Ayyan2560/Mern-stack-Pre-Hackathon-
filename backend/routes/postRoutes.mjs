import express from 'express';
import { createPost ,
        getAllPosts,
        getPostById , 
        updatePost, 
        deletePost , 
        togglePostLike,
        addComment,
        getPostComments,
        deleteComment,
         } from '../controllers/postController.mjs';
import { protect } from '../middleware/authmiddleware.mjs';
import upload from '../middleware/uploadMiddleware.mjs';
import { generatePostQR } from '../controllers/qrController.mjs';
import {toggleBookmark , getMyBookmarks} from '../controllers/bookmarkController.mjs';
         
const router = express.Router();


//Create Post
router.post( '/',protect,upload.array('images', 5),createPost);

//Generate QR Code for a Post
router.get('/:id/qr', generatePostQR);


//All Posts
//Delete, Update
router.get('/', getAllPosts);
router.delete('/:id', protect, deletePost);
router.patch('/:id', protect, updatePost);
//Bookmark Routes
router.patch('/:id/bookmark', protect, toggleBookmark);
router.get('/bookmarks/me', protect, getMyBookmarks);

//Get Post By Id
router.get('/:id', getPostById);

//Add Comment, Delete Comment, Like Post
router.get('/:id/comments', getPostComments);
router.post('/:id/comments', protect, addComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);
router.patch('/:id/like', protect, togglePostLike);




export default router;
