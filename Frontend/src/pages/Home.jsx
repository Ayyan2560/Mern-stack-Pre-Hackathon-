import { ArrowUpRight, PenLine, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import RightRail from '../components/layout/RightRail.jsx';
import PostCard from '../components/posts/PostCard.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { PostSkeletonList } from '../components/ui/Skeleton.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import { fetchFeed } from '../features/posts/postsSlice.mjs';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { SORT_OPTIONS } from '../utils/constants.js';

const todayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export default function Home() {
  useDocumentTitle('The journal');

  const dispatch = useDispatch();
  const feed = useSelector((state) => state.posts.feed);
  const user = useSelector((state) => state.auth.user);
  const [sort, setSort] = useState('newest');
  const lastKey = useRef(null);

  useEffect(() => {
    const key = `feed:${sort}`;
    if (lastKey.current === key) return;
    lastKey.current = key;
    dispatch(fetchFeed({ page: 1, sort }));
  }, [dispatch, sort]);

  const loadMore = () => {
    if (feed.loadingMore || !feed.pagination?.hasNextPage) return;
    dispatch(
      fetchFeed({
        page: (feed.pagination.currentPage || 1) + 1,
        sort,
        append: true,
      })
    );
  };

  const refresh = () => dispatch(fetchFeed({ page: 1, sort }));

  const handleSort = (nextSort) => {
    if (nextSort === sort) return;
    setSort(nextSort);
  };

  return (
    <div className="home-layout">
      <div className="home-main">
        <header className="masthead">
          <div className="masthead__top">
            <p className="eyebrow">{todayFormatter.format(new Date())}</p>
            <span className="masthead__issue">Vol. 01 · The daily edit</span>
          </div>
          <h1 className="masthead__title">
            The daily <em>edit.</em>
          </h1>
          <p className="masthead__intro">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}. A considered
            collection of stories from the people in your atelier.
          </p>
          <div className="masthead__rule" aria-hidden="true">
            <span />
          </div>
        </header>

        <div className="feed-toolbar">
          <SegmentedControl
            options={SORT_OPTIONS}
            value={sort}
            onChange={handleSort}
            label="Sort the journal"
          />
          <div className="feed-toolbar__actions">
            <button
              type="button"
              className="feed-refresh"
              onClick={refresh}
              aria-label="Refresh the journal"
              title="Refresh"
              disabled={feed.status === 'loading'}
            >
              <RefreshCw
                size={15}
                className={feed.status === 'loading' ? 'spin' : undefined}
                aria-hidden="true"
              />
            </button>
            <Link to="/create" className="btn btn--primary btn--sm feed-toolbar__compose">
              <PenLine size={15} aria-hidden="true" />
              Compose
            </Link>
          </div>
        </div>

        {feed.status === 'loading' && !feed.items.length ? (
          <PostSkeletonList count={3} />
        ) : null}

        {feed.status === 'failed' && !feed.items.length ? (
          <ErrorState
            title="The journal is out of reach"
            message={feed.error}
            onRetry={refresh}
          />
        ) : null}

        {feed.status === 'succeeded' && !feed.items.length ? (
          <EmptyState
            icon={Sparkles}
            title="A blank first page"
            description="No stories have been published yet. You could be the one to begin the edition."
            action={
              <Link to="/create" className="btn btn--primary btn--md">
                Write the first post
              </Link>
            }
          />
        ) : null}

        {feed.items.length ? (
          <div className="post-list">
            {feed.items.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : null}

        {feed.error && feed.items.length ? (
          <ErrorState
            compact
            title="Could not refresh"
            message={feed.error}
            onRetry={refresh}
          />
        ) : null}

        {feed.pagination?.hasNextPage ? (
          <div className="load-more">
            <Button variant="outline" loading={feed.loadingMore} onClick={loadMore}>
              {feed.loadingMore ? 'Turning the page…' : 'Read more entries'}
            </Button>
          </div>
        ) : feed.items.length ? (
          <div className="feed-end">
            <span aria-hidden="true" />
            <p>You’re all caught up</p>
            <Link to="/explore">
              Explore more <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>

      <RightRail />
    </div>
  );
}
