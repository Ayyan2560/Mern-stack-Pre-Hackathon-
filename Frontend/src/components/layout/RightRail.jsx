import { ArrowRight, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Avatar from '../ui/Avatar.jsx';
import { SectionLabel } from '../ui/PageHeader.jsx';
import { formatMonthYear } from '../../utils/format.js';

export default function RightRail() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm({ defaultValues: { q: '' } });

  const onSearch = ({ q }) => {
    const term = q.trim();
    if (!term) return;
    navigate(`/explore?q=${encodeURIComponent(term)}`);
  };

  const savedCount = user?.bookmarks?.length || 0;

  return (
    <aside className="right-rail" aria-label="Sidebar">
      <section className="rail-card rail-profile">
        <div className="rail-profile__wash" aria-hidden="true">
          <span>{user?.name?.slice(0, 1)?.toUpperCase() || 'A'}</span>
        </div>
        <div className="rail-profile__body">
          <Avatar user={user} size="lg" ring />
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <div className="rail-profile__meta">
            <span>Member since {formatMonthYear(user?.createdAt) || '2026'}</span>
            {savedCount ? <span>{savedCount} saved</span> : null}
          </div>
          <div className="rail-profile__actions">
            <Link to="/profile" className="btn btn--outline btn--sm">
              View profile
            </Link>
            <Link to="/profile/edit" className="btn btn--ghost btn--sm">
              Edit
            </Link>
          </div>
        </div>
      </section>

      <section className="rail-card">
        <SectionLabel>Find your people</SectionLabel>
        <p className="rail-card__copy">
          Search the atelier by name and discover new voices.
        </p>
        <form className="rail-search" onSubmit={handleSubmit(onSearch)} role="search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search members"
            aria-label="Search members by name"
            {...register('q')}
          />
          <button type="submit" aria-label="Search">
            <ArrowRight size={15} />
          </button>
        </form>
      </section>

      <section className="rail-card rail-note">
        <p className="eyebrow">A note from Aurel</p>
        <blockquote>
          “A slower feed, a longer thought, a little more care.”
        </blockquote>
        <div className="rail-note__links">
          <Link to="/explore">Explore the journal</Link>
          <Link to="/bookmarks">Your reading list</Link>
        </div>
      </section>

      <footer className="rail-footer">
        <span>© {new Date().getFullYear()} Aurel</span>
        <span>Edition 2026</span>
      </footer>
    </aside>
  );
}
