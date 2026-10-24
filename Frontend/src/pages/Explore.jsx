import { ArrowUpRight, Search, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import PostCard from '../components/posts/PostCard.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import { PostSkeletonList, Skeleton } from '../components/ui/Skeleton.jsx';
import { fetchExplorePosts } from '../features/posts/postsSlice.mjs';
import { useDebounce } from '../hooks/useDebounce.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import usersService from '../services/users.service.mjs';
import { getErrorMessage } from '../utils/errors.js';
import { formatMonthYear, userIdOf } from '../utils/format.js';

const TABS = [
  { value: 'posts', label: 'Stories' },
  { value: 'people', label: 'People' },
];

function UserResult({ user }) {
  const joined = formatMonthYear(user.createdAt);

  return (
    <Link to={`/users/${userIdOf(user)}`} className="user-result">
      <Avatar user={user} size="md" />
      <span className="user-result__copy">
        <span className="user-result__name">{user.name}</span>
        <span className="user-result__meta">
          {joined ? `Joined ${joined}` : 'Member of Aurel'}
        </span>
      </span>
      <span className="user-result__arrow" aria-hidden="true">
        <ArrowUpRight size={17} />
      </span>
    </Link>
  );
}

function PeopleSkeleton({ count = 4 }) {
  return (
    <div className="people-list" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="user-result user-result--skeleton" key={index}>
          <Skeleton className="skeleton--avatar" />
          <div className="skeleton-stack">
            <Skeleton width="130px" height="13px" />
            <Skeleton width="90px" height="11px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Explore() {
  useDocumentTitle('Explore');

  const dispatch = useDispatch();
  const explore = useSelector((state) => state.posts.explore);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [term, setTerm] = useState(initialQuery);
  const [tab, setTab] = useState(initialQuery ? 'posts' : 'posts');
  const debouncedTerm = useDebounce(term.trim(), 450);
  const lastQuery = useRef(null);

  const [people, setPeople] = useState({
    status: 'idle',
    items: [],
    total: 0,
    error: null,
  });

  const [peopleRetry, setPeopleRetry] = useState(0);

  // Keep the URL shareable without re-triggering every keystroke.
  useEffect(() => {
    const current = searchParams.get('q') || '';
    if (current === debouncedTerm) return;

    const next = new URLSearchParams(searchParams);
    if (debouncedTerm) next.set('q', debouncedTerm);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  }, [debouncedTerm, searchParams, setSearchParams]);

  // Sync external navigation (e.g. the sidebar search) into local state.
  // A one-way mirror of the URL is intentional here; it is not render state.
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery && urlQuery !== term) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTerm(urlQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const key = `explore:${debouncedTerm}`;
    if (lastQuery.current === key) return;
    lastQuery.current = key;
    dispatch(fetchExplorePosts({ query: debouncedTerm, page: 1 }));
  }, [dispatch, debouncedTerm]);

  useEffect(() => {
    if (tab !== 'people' || !debouncedTerm) {
      // Clearing results for an empty query is a deliberate reset.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPeople({ status: 'idle', items: [], total: 0, error: null });
      return undefined;
    }

    const controller = new AbortController();
    setPeople((state) => ({ ...state, status: 'loading', error: null }));

    usersService
      .searchUsers(debouncedTerm, { signal: controller.signal })
      .then((data) => {
        setPeople({
          status: 'succeeded',
          items: data.users || [],
          total: data.total || 0,
          error: null,
        });
      })
      .catch((error) => {
        if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') return;
        setPeople({
          status: 'failed',
          items: [],
          total: 0,
          error: getErrorMessage(error, 'Could not search members.'),
        });
      });

    return () => controller.abort();
  }, [tab, debouncedTerm, peopleRetry]);

  const loadMorePosts = () => {
    if (explore.loadingMore || !explore.pagination?.hasNextPage) return;
    dispatch(
      fetchExplorePosts({
        query: debouncedTerm,
        page: (explore.pagination.currentPage || 1) + 1,
        append: true,
      })
    );
  };

  const clearSearch = () => {
    setTerm('');
    setSearchParams({}, { replace: true });
    setTab('posts');
  };

  const isSearching = Boolean(debouncedTerm);
  const postCount = explore.pagination?.totalPosts ?? explore.items.length;

  return (
    <div className="explore">
      <PageHeader
        eyebrow="The open shelves"
        title={
          <>
            Explore the <em>atelier.</em>
          </>
        }
        description="Search stories by title or wording, or find people by name. Every result comes straight from the journal."
      />

      <div className="explore-search">
        <Search size={19} aria-hidden="true" />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search stories and people…"
          aria-label="Search stories and people"
          autoComplete="off"
        />
        {term ? (
          <button type="button" onClick={clearSearch} aria-label="Clear search">
            <X size={17} />
          </button>
        ) : null}
      </div>

      <div className="explore-toolbar">
        <SegmentedControl options={TABS} value={tab} onChange={setTab} label="Search category" />
        <p className="explore-count">
          {tab === 'posts'
            ? `${postCount} ${postCount === 1 ? 'story' : 'stories'}`
            : people.status === 'succeeded'
              ? `${people.total} ${people.total === 1 ? 'person' : 'people'}`
              : 'Members'}
        </p>
      </div>

      {tab === 'posts' ? (
        <>
          {explore.status === 'loading' ? <PostSkeletonList count={2} /> : null}

          {explore.status === 'failed' ? (
            <ErrorState
              title="Search unavailable"
              message={explore.error}
              onRetry={() => dispatch(fetchExplorePosts({ query: debouncedTerm, page: 1 }))}
            />
          ) : null}

          {explore.status === 'succeeded' && !explore.items.length ? (
            <EmptyState
              icon={Search}
              title={isSearching ? 'Nothing matched that search' : 'The shelves are empty'}
              description={
                isSearching
                  ? `No stories matched “${debouncedTerm}”. Try a different word or browse everything.`
                  : 'No stories have been published yet.'
              }
              action={
                isSearching ? (
                  <Button variant="outline" onClick={clearSearch}>
                    Clear search
                  </Button>
                ) : (
                  <Link to="/create" className="btn btn--primary btn--md">
                    Write a post
                  </Link>
                )
              }
            />
          ) : null}

          {explore.items.length ? (
            <div className="post-list">
              {explore.items.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : null}

          {explore.pagination?.hasNextPage ? (
            <div className="load-more">
              <Button
                variant="outline"
                loading={explore.loadingMore}
                onClick={loadMorePosts}
              >
                {explore.loadingMore ? 'Turning the page…' : 'Read more entries'}
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <>
          {!debouncedTerm ? (
            <EmptyState
              icon={Users}
              title="Find a familiar name"
              description="People search works by name. Type at least one character above to begin."
            />
          ) : null}

          {people.status === 'loading' ? <PeopleSkeleton /> : null}

          {people.status === 'failed' ? (
            <ErrorState
              title="Could not search members"
              message={people.error}
              onRetry={() => setPeopleRetry((value) => value + 1)}
            />
          ) : null}

          {people.status === 'succeeded' && !people.items.length ? (
            <EmptyState
              icon={Users}
              title="No members found"
              description={`No one matched “${debouncedTerm}”. Names must match to appear here.`}
            />
          ) : null}

          {people.items.length ? (
            <div className="people-list">
              {people.items.map((person) => (
                <UserResult key={userIdOf(person)} user={person} />
              ))}
            </div>
          ) : null}

          {people.status === 'succeeded' && people.total > people.items.length ? (
            <p className="explore-note">
              Showing the first {people.items.length} of {people.total} members. Refine your
              search to narrow the list.
            </p>
          ) : null}
        </>
      )}

      <p className="explore-footnote">
        Searches are sent to the backend as you type, with a short pause to avoid unnecessary
        requests.
      </p>
    </div>
  );
}
