import { Bookmark, RefreshCw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PostCard from '../components/posts/PostCard.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { PostSkeletonList } from '../components/ui/Skeleton.jsx';
import { fetchBookmarks } from '../features/posts/postsSlice.mjs';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Bookmarks() {
  useDocumentTitle('Saved posts');

  const dispatch = useDispatch();
  const bookmarks = useSelector((state) => state.posts.bookmarks);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    dispatch(fetchBookmarks());
  }, [dispatch]);

  const refresh = () => dispatch(fetchBookmarks());

  return (
    <div className="page-narrow">
      <PageHeader
        eyebrow="Your reading list"
        title={
          <>
            Saved <em>entries.</em>
          </>
        }
        description="The stories you wanted to return to. Removing a bookmark keeps the post in the journal."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            loading={bookmarks.status === 'loading'}
            leadingIcon={<RefreshCw size={14} aria-hidden="true" />}
          >
            Refresh
          </Button>
        }
      />

      {bookmarks.status === 'loading' && !bookmarks.items.length ? (
        <PostSkeletonList count={2} />
      ) : null}

      {bookmarks.status === 'failed' && !bookmarks.items.length ? (
        <ErrorState
          title="Could not open your reading list"
          message={bookmarks.error}
          onRetry={refresh}
        />
      ) : null}

      {bookmarks.status === 'succeeded' && !bookmarks.items.length ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Tap the bookmark on any post to keep it here for later."
          action={
            <Link to="/explore" className="btn btn--primary btn--md">
              Explore the journal
            </Link>
          }
        />
      ) : null}

      {bookmarks.items.length ? (
        <>
          <p className="list-caption">
            {bookmarks.items.length} saved {bookmarks.items.length === 1 ? 'entry' : 'entries'}
          </p>
          <div className="post-list">
            {bookmarks.items.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
