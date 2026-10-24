import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  addComment,
  deleteComment,
  fetchComments,
} from '../../features/posts/postsSlice.mjs';
import { commentSchema } from '../../schemas/index.js';
import {
  displayName,
  formatFullDate,
  timeAgo,
  userIdOf,
} from '../../utils/format.js';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import LoadingRow from '../ui/LoadingRow.jsx';

export default function CommentSection({ postId, postOwnerId }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const comments = useSelector((state) => state.posts.comments);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const requested = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: '' },
  });

  const text = watch('text') || '';

  useEffect(() => {
    if (requested.current === postId) return;
    requested.current = postId;
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const onSubmit = async (values) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      await dispatch(addComment({ postId, text: values.text.trim() })).unwrap();
      reset({ text: '' });
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Could not add your comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);

    try {
      await dispatch(
        deleteComment({ postId, commentId: deleteTarget._id })
      ).unwrap();
      toast.success('Comment deleted.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Could not delete this comment.');
    } finally {
      setDeleting(false);
    }
  };

  const items = comments.postId === postId ? comments.items : [];
  const status = comments.postId === postId ? comments.status : 'loading';
  const error = comments.postId === postId ? comments.error : null;

  return (
    <section className="comments" id="comments" aria-labelledby="comments-title">
      <div className="comments__head">
        <h2 id="comments-title">
          Conversation
          {items.length ? <span>{items.length}</span> : null}
        </h2>
        <span className="comments__rule" aria-hidden="true" />
      </div>

      <form className="comment-form" onSubmit={handleSubmit(onSubmit)}>
        <Avatar user={user} size="sm" />
        <div className="comment-form__main">
          <label className="sr-only" htmlFor="comment-text">
            Write a comment
          </label>
          <textarea
            id="comment-text"
            className={`comment-form__input ${errors.text ? 'is-invalid' : ''}`.trim()}
            placeholder="Add to the conversation…"
            rows={2}
            maxLength={1000}
            {...register('text')}
          />
          <div className="comment-form__foot">
            <span className={`comment-form__count ${text.length > 950 ? 'is-near' : ''}`.trim()}>
              {text.length}/1000
            </span>
            <Button
              type="submit"
              size="sm"
              loading={submitting}
              disabled={!text.trim()}
              trailingIcon={<Send size={14} aria-hidden="true" />}
            >
              Post comment
            </Button>
          </div>
          {errors.text ? (
            <p className="field__error" role="alert">
              {errors.text.message}
            </p>
          ) : null}
        </div>
      </form>

      {status === 'loading' ? <LoadingRow label="Opening the conversation" /> : null}

      {status === 'failed' ? (
        <ErrorState
          compact
          title="Could not load comments"
          message={error}
          onRetry={() => dispatch(fetchComments(postId))}
        />
      ) : null}

      {status === 'succeeded' && !items.length ? (
        <EmptyState
          icon={MessageCircle}
          title="No comments yet"
          description="Be the first to add a thoughtful note."
        />
      ) : null}

      {items.length ? (
        <ul className="comment-list">
          {items.map((comment) => {
            const author = comment.user;
            const authorId = userIdOf(author);
            const canDelete =
              Boolean(authorId) &&
              (authorId === userIdOf(user) || authorId === String(postOwnerId));

            return (
              <li key={comment._id} className="comment">
                <Avatar user={author} size="sm" />
                <div className="comment__body">
                  <div className="comment__head">
                    <span className="comment__name">{displayName(author)}</span>
                    <time
                      dateTime={comment.createdAt}
                      title={formatFullDate(comment.createdAt)}
                    >
                      {timeAgo(comment.createdAt)}
                    </time>
                    {canDelete ? (
                      <button
                        type="button"
                        className="comment__delete"
                        onClick={() => setDeleteTarget(comment)}
                        aria-label="Delete comment"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : null}
                  </div>
                  <p className="comment__text">{comment.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this comment?"
        description="This comment will be permanently removed from the conversation."
        confirmLabel="Delete comment"
      />
    </section>
  );
}
