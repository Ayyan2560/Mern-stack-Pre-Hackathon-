import { ArrowLeft, QrCode } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import CommentSection from '../components/posts/CommentSection.jsx';
import PostCard from '../components/posts/PostCard.jsx';
import QrDialog from '../components/posts/QrDialog.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { PostSkeleton } from '../components/ui/Skeleton.jsx';
import { fetchPost } from '../features/posts/postsSlice.mjs';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { userIdOf } from '../utils/format.js';

export default function PostDetail() {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const detail = useSelector((state) => state.posts.detail);
  const [qrOpen, setQrOpen] = useState(false);
  const fetchedFor = useRef(null);

  const post = detail.post?._id === postId ? detail.post : null;
  useDocumentTitle(post?.title || 'Post');

  useEffect(() => {
    if (fetchedFor.current === postId) return;
    fetchedFor.current = postId;
    dispatch(fetchPost(postId));
  }, [dispatch, postId]);

  useEffect(() => {
    if (!post || location.hash !== '#comments') return undefined;

    const timer = window.setTimeout(() => {
      document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [post, location.hash]);

  const retry = () => {
    fetchedFor.current = postId;
    dispatch(fetchPost(postId));
  };

  if (detail.status === 'loading' && !post) {
    return (
      <div className="post-detail">
        <Link to="/" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to the journal
        </Link>
        <div className="post-list">
          <PostSkeleton />
        </div>
      </div>
    );
  }

  if (detail.status === 'failed' && !post) {
    return (
      <div className="post-detail">
        <Link to="/" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to the journal
        </Link>
        <ErrorState
          title="This entry could not be opened"
          message={detail.error}
          onRetry={retry}
        />
        <p className="post-detail__hint">
          It may have been removed, or the link may be incomplete.
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail">
        <PostSkeleton />
      </div>
    );
  }

  return (
    <div className="post-detail">
      <div className="post-detail__bar">
        <Link to="/" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to the journal
        </Link>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setQrOpen(true)}
        >
          <QrCode size={15} aria-hidden="true" />
          QR code
        </button>
      </div>

      <PostCard
        post={post}
        detailed
        onDeleted={() => navigate('/', { replace: true })}
        onOpenQr={() => setQrOpen(true)}
      />

      <CommentSection postId={postId} postOwnerId={userIdOf(post.user)} />

      <QrDialog
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        postId={postId}
        postTitle={post.title}
      />
    </div>
  );
}
