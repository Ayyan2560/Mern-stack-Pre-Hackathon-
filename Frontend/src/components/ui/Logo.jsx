import { Link } from 'react-router-dom';

export default function Logo({ to = '/', tone = 'dark', compact = false, className = '' }) {
  return (
    <Link
      to={to}
      className={`logo logo--${tone} ${compact ? 'logo--compact' : ''} ${className}`.trim()}
    >
      <span className="logo__word">aurel</span>{' '}
      <span className="logo__dot" aria-hidden="true" />
      {!compact && <span className="logo__rule" aria-hidden="true" />}
      {!compact && <span className="logo__tagline">The Social Atelier</span>}
    </Link>
  );
}
