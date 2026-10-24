import { MailCheck, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet } from 'react-router-dom';
import { fetchUnreadCount } from '../../features/notifications/notificationsSlice.mjs';
import MobileNav from './MobileNav.jsx';
import MobileTopBar from './MobileTopBar.jsx';
import Sidebar from './Sidebar.jsx';

function VerificationBanner() {
  const user = useSelector((state) => state.auth.user);
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.isEmailVerified !== false || dismissed) return null;

  return (
    <div className="verify-banner" role="status">
      <MailCheck size={17} aria-hidden="true" />
      <p>
        Your email isn’t verified yet. Verify it to secure your account.
      </p>
      <Link to="/verify-email" state={{ email: user.email }} className="verify-banner__link">
        Verify now
      </Link>
      <button
        type="button"
        className="verify-banner__close"
        aria-label="Dismiss reminder"
        onClick={() => setDismissed(true)}
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default function AppShell() {
  const dispatch = useDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      dispatch(fetchUnreadCount());
    }, 180000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        dispatch(fetchUnreadCount());
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [dispatch]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Sidebar />
      <MobileTopBar />

      <main className="app-main" id="main-content">
        <VerificationBanner />
        <div className="app-main__inner">
          <Outlet />
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
