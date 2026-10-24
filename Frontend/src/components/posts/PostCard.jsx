import {
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  toggleBookmark,
  toggleLike,
} from '../../features/posts/postsSlice.mjs';
import {
  displayName,
  formatFullDate,
  isEdited,
  timeAgo,
  truncate,
  userIdOf,
} from '../../utils/format.js';
import { shareOrCopy } from '../../utils/share.js';
import Avatar from '../ui/Avatar.jsx';
import PostGallery from './PostGallery.jsx';
import PostMenu from './PostMenu.jsx';

export default function PostCard({
  post,
  detailed = false,
  onDeleted,
  onOpenQr,
}) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const pendingLikes = useSelector((state) => state.posts.pendingLikes);
  const pendingBookmarks = useSelector((state) => state.posts.pendingBookmarks);
  const bookmarkedIds = useSelector((state) => state.posts.bookmarkedIds);

  if (!post) return null;

  const author = post.user;
  const authorId = userIdOf(author);
  const currentId = userIdOf(currentUser);
  const isOwnPost = Boolean(authorId && currentId && authorId === currentId);
  const authorLink = isOwnPost ? '/profile' : authorId ? `/users/${authorId}` : null;

  const liked = (post.likes || []).some((id) => String(id) === String(currentId));
  const likeCount = post.totalLikes ?? (post.likes || []).length;
  const commentCount = (post.comments || []).length;
  const bookmarked = bookmarkedIds.includes(post._id);
  const likePending = pendingLikes.includes(post._id);
  const bookmarkPending = pendingBookmarks.includes(post._id);

  const { text: body, truncated } = truncate(post.content, detailed ? Infinity : 520);

  const handleLike = async () => {
    if (likePending) return;

    try {
      await dispatch(toggleLike(post._id)).unwrap();
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Could not update your like.');
    }
  };

  const handleBookmark = async () => {
    if (bookmarkPending) return;

    try {
      await dispatch(toggleBookmark(post._id)).unwrap();
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Could not update your saved posts.');
    }
  };

  const handleShare = async () => {
    const result = await shareOrCopy(post);

    if (result === 'copied') toast.success('Post link copied.');
    if (result === 'failed') toast.error('Could not share this post.');
  };

  return (
    <article className={`post-card ${detailed ? 'post-card--detailed' : ''}`.trim()}>
      <header className="post-card__head">
        {authorLink ? (
          <Link to={authorLink} className="post-card__author" aria-label={`View ${displayName(author)}`}>
            <Avatar user={author} size={detailed ? 'md' : 'md'} />
            <span className="post-card__author-copy">
              <span className="post-card__name">{displayName(author)}</span>
              <span className="post-card__meta">
                <time dateTime={post.createdAt} title={formatFullDate(post.createdAt)}>
                  {timeAgo(post.createdAt)}
                </time>
                {isEdited(post) ? (
                  <>
                    <span className="dot" aria-hidden="true" />
                    <span>Edited</span>
                  </>
                ) : null}
              </span>
            </span>
          </Link>
        ) : (
          <div className="post-card__author">
            <Avatar user={author} size="md" />
            <span className="post-card__author-copy">
              <span className="post-card__name">{displayName(author)}</span>
              <span className="post-card__meta">
                <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
              </span>
            </span>
          </div>
        )}

        <PostMenu post={post} onDeleted={onDeleted} onOpenQr={onOpenQr} detailed={detailed} />
      </header>

      <div className="post-card__body">
        {detailed ? (
          <h1 className="post-card__title post-card__title--hero">{post.title}</h1>
        ) : (
          <h2 className="post-card__title">
            <Link to={`/posts/${post._id}`}>{post.title}</Link>
          </h2>
        )}

        <p className="post-card__content">{body}</p>

        {truncated ? (
          <Link to={`/posts/${post._id}`} className="post-card__read-more">
            Continue reading
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>

      <PostGallery images={post.images || []} title={post.title} />

      <footer className="post-card__actions">
        <button
          type="button"
          className={`post-action ${liked ? 'is-active' : ''}`.trim()}
          onClick={handleLike}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike this post' : 'Like this post'}
          disabled={likePending}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} aria-hidden="true" />
          <span>{likeCount > 0 ? likeCount : 'Like'}</span>
        </button>

        <Link
          to={`/posts/${post._id}#comments`}
          className="post-action"
          aria-label={`${commentCount} comments`}
        >
          <MessageCircle size={18} aria-hidden="true" />
          <span>{commentCount > 0 ? commentCount : 'Comment'}</span>
        </Link>

        <button
          type="button"
          className={`post-action ${bookmarked ? 'is-active' : ''}`.trim()}
          onClick={handleBookmark}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? 'Remove from saved posts' : 'Save this post'}
          disabled={bookmarkPending}
        >
          <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} aria-hidden="true" />
          <span>{bookmarked ? 'Saved' : 'Save'}</span>
        </button>

        <button
          type="button"
          className="post-action post-action--share"
          onClick={handleShare}
          aria-label="Share this post"
        >
          <Share2 size={17} aria-hidden="true" />
          <span className="post-action__share-label">Share</span>
        </button>
      </footer>
    </article>
  );
}
