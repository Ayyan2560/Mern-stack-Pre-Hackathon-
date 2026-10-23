import express from 'express';
import {   getNotifications, markNotificationRead  , getUnreadNotificationCount, markAllNotificationsRead,  } from '../controllers/notificationController.mjs';
import { protect } from '../middleware/authmiddleware.mjs';

const router = express.Router();
// Get all notifications for the logged-in user
router.get('/', protect, getNotifications);
// Get the count of unread notifications for the logged-in user
router.get('/unread-count', protect, getUnreadNotificationCount);
// Mark all notifications as read for the logged-in user
router.patch('/read-all', protect, markAllNotificationsRead);
// Mark a notification as read
router.patch('/:id/read', protect, markNotificationRead);
export default router;