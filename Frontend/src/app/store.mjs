import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.mjs';
import notificationsReducer from '../features/notifications/notificationsSlice.mjs';
import postsReducer from '../features/posts/postsSlice.mjs';
import profileReducer from '../features/profile/profileSlice.mjs';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    profile: profileReducer,
    notifications: notificationsReducer,
  },
  devTools: import.meta.env.DEV,
});
