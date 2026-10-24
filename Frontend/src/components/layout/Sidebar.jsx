import { Compass, Home, Bell, Bookmark, PenLine, Search, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import AccountMenu from './AccountMenu.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/bookmarks', label: 'Saved', icon: Bookmark },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: true },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export default function Sidebar() {
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm({ defaultValues: { q: '' } });
  const [searchFocused, setSearchFocused] = useState(false);

  const onSearch = ({ q }) => {
    const term = q.trim();
    if (!term) return;
    reset({ q: '' });
    setSearchFocused(false);
    navigate(`/explore?q=${encodeURIComponent(term)}`);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <Logo tone="light" />
      </div>

      <form className="sidebar-search" onSubmit={handleSubmit(onSearch)} role="search">
        <Search size={15} aria-hidden="true" />
        <input
          type="search"
          placeholder="Find people"
          aria-label="Search people by name"
          {...register('q')}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {searchFocused ? <span className="sidebar-search__hint">↵</span> : null}
      </form>

      <nav className="sidebar-nav" aria-label="Primary">
        <p className="sidebar-nav__label">Journal</p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `sidebar-nav__link ${isActive ? 'is-active' : ''}`.trim()
            }
          >
            <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
            <span>{label}</span>
            {badge && unreadCount > 0 ? (
              <span className="sidebar-nav__badge" aria-label={`${unreadCount} unread`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <NavLink to="/create" className="sidebar-compose">
        <PenLine size={17} aria-hidden="true" />
        <span>Compose</span>
      </NavLink>

      <div className="sidebar__foot">
        <div className="sidebar__edition">
          <span className="sidebar__edition-dot" aria-hidden="true" />
          <span>Edition 2026</span>
        </div>
        <AccountMenu variant="sidebar" />
      </div>
    </aside>
  );
}
