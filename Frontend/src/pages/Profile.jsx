import {
  CalendarDays,
  KeyRound,
  Mail,
  PenLine,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AvatarEditor from '../components/profile/AvatarEditor.jsx';
import ProfileSkeleton from '../components/profile/ProfileSkeleton.jsx';
import PostCard from '../components/posts/PostCard.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { SectionLabel } from '../components/ui/PageHeader.jsx';
import { PostSkeletonList } from '../components/ui/Skeleton.jsx';
import { fetchMyProfile } from '../features/profile/profileSlice.mjs';
import {
  fetchUserPosts,
} from '../features/posts/postsSlice.mjs';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import {
  formatMonthYear,
  getInitials,
  userIdOf,
} from '../utils/format.js';

export default function Profile() {
  useDocumentTitle('Your profile');

  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.profile);
  const userPosts = useSelector((state) => state.posts.userPosts);

  const me = { ...authUser, ...(profile.me || {}) };
  const id = userIdOf(me);
  const postsEntry = id ? userPosts[id] : null;

  const profileRequested = useRef(false);
  const postsRequested = useRef(null);

  useEffect(() => {
    if (profileRequested.current) return;
    profileRequested.current = true;
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (!id || postsRequested.current === id) return;
    postsRequested.current = id;
    dispatch(fetchUserPosts({ userId: id, page: 1 }));
  }, [dispatch, id]);

  const totalPosts = postsEntry?.pagination?.totalPosts ?? postsEntry?.items.length ?? 0;
  const savedCount = me.bookmarks?.length ?? 0;
  const joined = formatMonthYear(me.createdAt);
  const verifying = me.isEmailVerified === false;
  const verified = me.isEmailVerified === true;

  const loadMore = () => {
    if (!postsEntry?.pagination?.hasNextPage || postsEntry.loadingMore) return;
    dispatch(
      fetchUserPosts({
        userId: id,
        page: (postsEntry.pagination.currentPage || 1) + 1,
        append: true,
      })
    );
  };

  return (
    <div className="profile-page">
      {profile.status === 'loading' && !profile.me ? (
        <ProfileSkeleton />
      ) : (
        <section className="profile-hero" aria-labelledby="profile-name">
          <div className="profile-cover" aria-hidden="true">
            <span className="profile-cover__initial">{getInitials(me.name)}</span>
            <span className="profile-cover__edition">Member edition · No. 01</span>
          </div>

          <div className="profile-head">
            <div className="profile-avatar">
              <AvatarEditor size="xl" compact />
            </div>

            <div className="profile-identity">
              <p className="eyebrow">Your corner of Aurel</p>
              <div className="profile-name-row">
                <h1 id="profile-name">{me.name}</h1>
                {verified ? (
                  <span className="verified-badge" title="Email verified">
                    <ShieldCheck size={14} aria-hidden="true" />
                    Verified
                  </span>
                ) : null}
              </div>

              <div className="profile-meta">
                <span>
                  <Mail size={14} aria-hidden="true" />
                  {me.email}
                </span>
                {joined ? (
                  <span>
                    <CalendarDays size={14} aria-hidden="true" />
                    Member since {joined}
                  </span>
                ) : null}
              </div>

              {verifying ? (
                <div className="profile-verify">
                  <ShieldAlert size={16} aria-hidden="true" />
                  <p>Your email hasn’t been verified.</p>
                  <Link to="/verify-email" state={{ email: me.email }}>
                    Verify now
                  </Link>
                </div>
              ) : null}

              <div className="profile-actions">
                <Link to="/profile/edit" className="btn btn--primary btn--sm">
                  <Settings2 size={15} aria-hidden="true" />
                  Edit profile
                </Link>
                <Link to="/profile/change-password" className="btn btn--outline btn--sm">
                  <KeyRound size={15} aria-hidden="true" />
                  Change password
                </Link>
                <Link to="/create" className="btn btn--ghost btn--sm">
                  <PenLine size={15} aria-hidden="true" />
                  New post
                </Link>
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <div>
              <span className="profile-stats__value">{totalPosts}</span>
              <span className="profile-stats__label">Published</span>
            </div>
            <div>
              <span className="profile-stats__value">{savedCount}</span>
              <span className="profile-stats__label">Saved</span>
            </div>
            <div>
              <span className="profile-stats__value">{joined ? joined.split(' ')[1] : '—'}</span>
              <span className="profile-stats__label">Member since</span>
            </div>
          </div>
        </section>
      )}

      {profile.status === 'failed' && !profile.me ? (
        <ErrorState
          compact
          title="Profile details unavailable"
          message={profile.error}
          onRetry={() => dispatch(fetchMyProfile())}
        />
      ) : null}

      <section className="profile-journal" aria-labelledby="profile-journal-title">
        <SectionLabel
          action={
            <Link to="/create" className="text-link">
              Compose
            </Link>
          }
        >
          <span id="profile-journal-title">Your journal</span>
        </SectionLabel>

        {(!postsEntry || postsEntry.status === 'loading') && !postsEntry?.items.length ? (
          <PostSkeletonList count={2} />
        ) : null}

        {postsEntry?.status === 'failed' && !postsEntry.items.length ? (
          <ErrorState
            title="Could not load your posts"
            message={postsEntry.error}
            onRetry={() => {
              postsRequested.current = null;
              dispatch(fetchUserPosts({ userId: id, page: 1 }));
            }}
          />
        ) : null}

        {postsEntry?.status === 'succeeded' && !postsEntry.items.length ? (
          <EmptyState
            icon={Sparkles}
            title="Your first page awaits"
            description="Share a story and it will appear here in your personal journal."
            action={
              <Link to="/create" className="btn btn--primary btn--md">
                Write your first post
              </Link>
            }
          />
        ) : null}

        {postsEntry?.items.length ? (
          <div className="post-list">
            {postsEntry.items.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : null}

        {postsEntry?.pagination?.hasNextPage ? (
          <div className="load-more">
            <Button variant="outline" loading={postsEntry.loadingMore} onClick={loadMore}>
              {postsEntry.loadingMore ? 'Turning the page…' : 'Read more entries'}
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
