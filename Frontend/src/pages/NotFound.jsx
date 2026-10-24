import { ArrowLeft, Compass, Home } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page not found');

  const user = useSelector((state) => state.auth.user);

  return (
    <main className="not-found">
      <div className="not-found__inner">
        <Logo tone="dark" to={user ? '/' : '/login'} />
        <p className="eyebrow">A missing page</p>
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <h1>
          This page has left the <em>atelier.</em>
        </h1>
        <p className="not-found__copy">
          The address may be mistyped, or the page may have been moved. The journal is still
          open.
        </p>
        <div className="not-found__actions">
          <Link to={user ? '/' : '/login'} className="btn btn--primary btn--md">
            <Home size={16} aria-hidden="true" />
            {user ? 'Back to the journal' : 'Sign in'}
          </Link>
          {user ? (
            <Link to="/explore" className="btn btn--outline btn--md">
              <Compass size={16} aria-hidden="true" />
              Explore
            </Link>
          ) : (
            <Link to="/signup" className="btn btn--outline btn--md">
              Create an account
            </Link>
          )}
        </div>
        <Link to="/" className="not-found__back">
          <ArrowLeft size={14} aria-hidden="true" />
          Return home
        </Link>
      </div>
    </main>
  );
}
