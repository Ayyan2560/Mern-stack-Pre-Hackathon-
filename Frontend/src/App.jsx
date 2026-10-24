import { useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';
import { bootstrapAuth, sessionExpired } from './features/auth/authSlice.mjs';
import { fetchBookmarks } from './features/posts/postsSlice.mjs';
import Bookmarks from './pages/Bookmarks.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import CreatePost from './pages/CreatePost.jsx';
import EditPost from './pages/EditPost.jsx';
import EditProfile from './pages/EditProfile.jsx';
import Explore from './pages/Explore.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import Notifications from './pages/Notifications.jsx';
import PostDetail from './pages/PostDetail.jsx';
import Profile from './pages/Profile.jsx';
import UserProfile from './pages/UserProfile.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import Login from './pages/auth/Login.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import Signup from './pages/auth/Signup.jsx';
import VerifyEmail from './pages/auth/VerifyEmail.jsx';
import GuestRoute from './routes/GuestRoute.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import ScrollToTop from './routes/ScrollToTop.jsx';
import { SESSION_EXPIRED_EVENT } from './utils/constants.js';

export default function App() {
  const dispatch = useDispatch();
  const { user, token, initialized } = useSelector((state) => state.auth);
  const bootstrapped = useRef(false);
  const bookmarksRequested = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    dispatch(bootstrapAuth());
  }, [dispatch]);

  // Posts do not include bookmark state, so load the saved list once per
  // session to keep every Save control accurate.
  useEffect(() => {
    if (!initialized || !token) {
      bookmarksRequested.current = false;
      return;
    }

    if (!user || bookmarksRequested.current) return;
    bookmarksRequested.current = true;
    dispatch(fetchBookmarks());
  }, [dispatch, initialized, token, user]);

  useEffect(() => {
    const handleExpired = () => {
      dispatch(sessionExpired());
      toast.error('Your session has expired. Please sign in again.');
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/posts/:postId" element={<PostDetail />} />
            <Route path="/posts/:postId/edit" element={<EditPost />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />
            <Route path="/users/:userId" element={<UserProfile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster
        position="bottom-center"
        gutter={10}
        toastOptions={{
          duration: 3800,
          className: 'aurel-toast',
          success: { duration: 3200 },
          error: { duration: 4600 },
        }}
      />
    </BrowserRouter>
  );
}
