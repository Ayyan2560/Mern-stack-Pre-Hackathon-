import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';

export default function AuthShell({ children, backTo = '/', backLabel = 'Back to the journal' }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="auth-aside__top">
          <Logo tone="light" to="/login" />
        </div>

        <div className="auth-aside__content">
          <p className="eyebrow eyebrow--light">A social atelier · Est. 2026</p>
          <h1>
            A quieter way
            <br />
            <em>to be seen.</em>
          </h1>
          <p className="auth-aside__copy">
            A considered space for stories, images and ideas — built for the people
            you choose to keep close.
          </p>
          <div className="auth-aside__seal" aria-hidden="true">
            <span>A</span>
            <span className="auth-aside__seal-ring" />
          </div>
        </div>

        <div className="auth-aside__foot">
          <span>Private edition</span>
          <span className="auth-aside__foot-rule" aria-hidden="true" />
          <span>No. 01</span>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-main__nav">
          <Link to={backTo} className="auth-back">
            <ArrowLeft size={15} aria-hidden="true" />
            {backLabel}
          </Link>
          <span className="auth-main__mark">A.</span>
        </div>

        <div className="auth-main__center">
          <div className="auth-card">{children}</div>
        </div>

        <footer className="auth-main__footer">
          <span>© {new Date().getFullYear()} Aurel</span>
          <span>Crafted for considered connection.</span>
        </footer>
      </main>
    </div>
  );
}
