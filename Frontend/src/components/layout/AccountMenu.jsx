import { ChevronDown, LogOut, PenLine, Settings, UserRound } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../features/auth/authSlice.mjs';
import Dropdown from '../ui/Dropdown.jsx';
import Avatar from '../ui/Avatar.jsx';

export default function AccountMenu({ variant = 'sidebar' }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    await dispatch(logoutUser());
    toast.success('Signed out. See you soon.');
    navigate('/login', { replace: true });
    setSigningOut(false);
  };

  return (
    <Dropdown
      className={`account ${variant === 'compact' ? 'account--compact' : ''}`}
      renderTrigger={({ open, toggle, menuId }) => (
        <button
          type="button"
          className={`account__trigger ${open ? 'is-open' : ''}`.trim()}
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
        >
          <Avatar user={user} size={variant === 'compact' ? 'sm' : 'md'} />
          {variant === 'sidebar' ? (
            <span className="account__identity">
              <span className="account__name">{user?.name || 'Your profile'}</span>
              <span className="account__email">{user?.email || 'Member'}</span>
            </span>
          ) : null}
          <ChevronDown size={15} className="account__chevron" aria-hidden="true" />
        </button>
      )}
    >
      {(close) => (
        <>
          {variant === 'compact' ? (
            <div className="dropdown__identity">
              <span className="dropdown__name">{user?.name}</span>
              <span className="dropdown__email">{user?.email}</span>
            </div>
          ) : null}
          <Link to="/profile" className="dropdown__item" role="menuitem" onClick={close}>
            <UserRound size={16} aria-hidden="true" />
            <span>My profile</span>
          </Link>
          <Link to="/profile/edit" className="dropdown__item" role="menuitem" onClick={close}>
            <Settings size={16} aria-hidden="true" />
            <span>Edit profile</span>
          </Link>
          <Link to="/create" className="dropdown__item" role="menuitem" onClick={close}>
            <PenLine size={16} aria-hidden="true" />
            <span>New post</span>
          </Link>
          <div className="dropdown__divider" role="separator" />
          <button
            type="button"
            className="dropdown__item dropdown__item--danger"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut size={16} aria-hidden="true" />
            <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </>
      )}
    </Dropdown>
  );
}
