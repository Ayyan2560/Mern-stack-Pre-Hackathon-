import { Bell, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import Avatar from '../ui/Avatar.jsx';

export default function MobileTopBar() {
  const user = useSelector((state) => state.auth.user);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  return (
    <header className="mobile-topbar">
      <Logo tone="dark" compact to="/" />
      <div className="mobile-topbar__actions">
        <Link to="/explore" className="mobile-topbar__btn" aria-label="Search">
          <Search size={19} />
        </Link>
        <Link to="/notifications" className="mobile-topbar__btn" aria-label="Notifications">
          <Bell size={19} />
          {unreadCount > 0 ? <span className="mobile-topbar__dot" aria-hidden="true" /> : null}
        </Link>
        <Link to="/profile" className="mobile-topbar__avatar" aria-label="Your profile">
          <Avatar user={user} size="sm" />
        </Link>
      </div>
    </header>
  );
}
