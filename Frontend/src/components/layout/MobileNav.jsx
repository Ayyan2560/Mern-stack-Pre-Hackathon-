import { Bell, Bookmark, Compass, Home, Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/create', label: 'Compose', icon: Plus, primary: true },
  { to: '/bookmarks', label: 'Saved', icon: Bookmark },
  { to: '/notifications', label: 'Alerts', icon: Bell, badge: true },
];

export default function MobileNav() {
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  return (
    <nav className="mobile-nav" aria-label="Primary mobile navigation">
      {ITEMS.map(({ to, label, icon: Icon, end, primary, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `mobile-nav__item ${primary ? 'mobile-nav__item--primary' : ''} ${
              isActive ? 'is-active' : ''
            }`.trim()
          }
        >
          <span className="mobile-nav__icon">
            <Icon size={primary ? 22 : 20} strokeWidth={primary ? 2 : 1.8} aria-hidden="true" />
            {badge && unreadCount > 0 ? (
              <span className="mobile-nav__badge" aria-label={`${unreadCount} unread`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </span>
          <span className="mobile-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
