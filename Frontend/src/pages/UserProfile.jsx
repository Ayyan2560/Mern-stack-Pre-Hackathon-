import {
  ArrowLeft,
  CalendarDays,
  Compass,
  Sparkles,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useParams } from 'react-router-dom';
import PostCard from '../components/posts/PostCard.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { SectionLabel } from '../components/ui/PageHeader.jsx';
import { PostSkeletonList } from '../components/ui/Skeleton.jsx';
import ProfileSkeleton from '../components/profile/ProfileSkeleton.jsx';
import { fetchUserPosts } from '../features/posts/postsSlice.mjs';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import usersService from '../services/users.service.mjs';
import { getErrorMessage, isCanceled } from '../utils/errors.js';
import {
  formatMonthYear,
  getInitials,
  userIdOf,
} from '../utils/format.js';

export default function UserProfile() {
  const { userId } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  const isSelf = String(userIdOf(currentUser)) === String(userId);

  if (isSelf) {
    return <Navigate to="/profile" replace />;
  }

  // Keying on the route param remounts the member view, so a new profile
  // starts from a clean loading state instead of resetting it in an effect.
  return <MemberProfile key={userId} userId={userId} />;
}

function MemberProfile({ userId }) {
  const dispatch = useDispatch();
  const userPosts = useSelector((state) => state.posts.userPosts);

  const [profile, setProfile] = useState({
    status: 'loading',
    user: null,
    error: null,
  });

  const postsEntry = userPosts[userId];

  useDocumentTitle(profile.user?.name || 'Member profile');

  const request = useCallback(
    (signal) => {
      usersService
        .getUserById(userId, { signal })
        .then((data) => {
          setProfile({ status: 'succeeded', user: data.user, error: null });
        })
        .catch((error) => {
          if (isCanceled(error)) return;
          setProfile({
            status: 'failed',
            user: null,
            error: getErrorMessage(error, 'Could not load this member.'),
          });
        });
    },
    [userId]
  );

  useEffect(() => {
    const controller = new AbortController();
    request(controller.signal);
    return () => controller.abort();
  }, [request]);

  useEffect(() => {
    if (postsEntry && postsEntry.status !== 'failed') return;
    dispatch(fetchUserPosts({ userId, page: 1 }));
    // Only fetch once per profile visit unless a retry is requested.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, userId]);

  const handleProfileRetry = () => {
    setProfile({ status: 'loading', user: null, error: null });
    request();
  };

  if (profile.status === 'loading') {
    return (
      <div className="profile-page">
        <ProfileSkeleton />
      </div>
    );
  }

  if (profile.status === 'failed') {
    return (
      <div className="profile-page page-narrow">
        <Link to="/explore" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to explore
        </Link>
        <ErrorState
          title="This profile could not be opened"
          message={profile.error}
          onRetry={handleProfileRetry}
        />
      </div>
    );
  }

  const person = profile.user;
  const joined = formatMonthYear(person.createdAt);
  const totalPosts = postsEntry?.pagination?.totalPosts ?? postsEntry?.items.length ?? 0;

  const loadMore = () => {
    if (!postsEntry?.pagination?.hasNextPage || postsEntry.loadingMore) return;
    dispatch(
      fetchUserPosts({
        userId,
        page: (postsEntry.pagination.currentPage || 1) + 1,
        append: true,
      })
    );
  };

  return (
    <div className="profile-page">
      <Link to="/explore" className="back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to explore
      </Link>

      <section className="profile-hero" aria-labelledby="member-name">
        <div className="profile-cover" aria-hidden="true">
          <span className="profile-cover__initial">{getInitials(person.name)}</span>
          <span className="profile-cover__edition">Member edition · Aurel</span>
        </div>

        <div className="profile-head">
          <div className="profile-avatar profile-avatar--static">
            <Avatar user={person} size="xl" ring />
          </div>

          <div className="profile-identity">
            <p className="eyebrow">Member of the atelier</p>
            <h1 id="member-name">{person.name}</h1>

            <div className="profile-meta">
              {joined ? (
                <span>
                  <CalendarDays size={14} aria-hidden="true" />
                  Joined {joined}
                </span>
              ) : null}
              <span>
                <Compass size={14} aria-hidden="true" />
                Public profile
              </span>
            </div>

            <div className="profile-actions">
              <Link to="/explore" className="btn btn--outline btn--sm">
                Discover more members
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
            <span className="profile-stats__value">{joined ? joined.split(' ')[1] : '—'}</span>
            <span className="profile-stats__label">Joined</span>
          </div>
          <div>
            <span className="profile-stats__value">Public</span>
            <span className="profile-stats__label">Journal</span>
          </div>
        </div>
      </section>

      <section className="profile-journal" aria-labelledby="member-journal-title">
        <SectionLabel>
          <span id="member-journal-title">The journal of {person.name.split(' ')[0]}</span>
        </SectionLabel>

        {(!postsEntry || postsEntry.status === 'loading') && !postsEntry?.items.length ? (
          <PostSkeletonList count={2} />
        ) : null}

        {postsEntry?.status === 'failed' && !postsEntry.items.length ? (
          <ErrorState
            title="Could not load these posts"
            message={postsEntry.error}
            onRetry={() => dispatch(fetchUserPosts({ userId, page: 1 }))}
          />
        ) : null}

        {postsEntry?.status === 'succeeded' && !postsEntry.items.length ? (
          <EmptyState
            icon={Sparkles}
            title="No entries yet"
            description={`${person.name} hasn’t published a story yet. Check back soon.`}
            action={
              <Link to="/explore" className="btn btn--outline btn--md">
                Explore other stories
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
