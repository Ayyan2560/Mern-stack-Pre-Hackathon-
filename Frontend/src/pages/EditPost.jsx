import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ImageOff, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { Field, TextArea, TextInput } from '../components/ui/Field.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { PostSkeleton } from '../components/ui/Skeleton.jsx';
import { fetchPost, updatePost } from '../features/posts/postsSlice.mjs';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { postSchema } from '../schemas/index.js';
import { userIdOf } from '../utils/format.js';

export default function EditPost() {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const detail = useSelector((state) => state.posts.detail);
  const currentUser = useSelector((state) => state.auth.user);
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const fetchedFor = useRef(null);

  const post = detail.post?._id === postId ? detail.post : null;
  useDocumentTitle(post ? `Edit ${post.title}` : 'Edit post');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: { title: '', content: '' },
  });

  const title = watch('title') || '';
  const content = watch('content') || '';

  useEffect(() => {
    if (fetchedFor.current === postId) return;
    fetchedFor.current = postId;
    dispatch(fetchPost(postId));
  }, [dispatch, postId]);

  useEffect(() => {
    if (!post) return;
    reset({ title: post.title || '', content: post.content || '' });
  }, [post, reset]);

  const isOwner = post && userIdOf(post.user) === userIdOf(currentUser);

  const onSubmit = async (values) => {
    setServerError('');
    setSaving(true);

    try {
      const result = await dispatch(
        updatePost({
          postId,
          title: values.title.trim(),
          content: values.content.trim(),
        })
      ).unwrap();

      toast.success(result.message || 'Post updated.');
      navigate(`/posts/${postId}`);
    } catch (message) {
      setServerError(typeof message === 'string' ? message : 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  if (detail.status === 'loading' && !post) {
    return (
      <div className="edit-post">
        <PostSkeleton />
      </div>
    );
  }

  if (detail.status === 'failed' && !post) {
    return (
      <div className="edit-post">
        <Link to="/" className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to the journal
        </Link>
        <ErrorState
          title="Could not load this post"
          message={detail.error}
          onRetry={() => dispatch(fetchPost(postId))}
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="edit-post">
        <PostSkeleton />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="edit-post page-narrow">
        <Link to={`/posts/${postId}`} className="back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to the post
        </Link>
        <ErrorState
          title="This entry is not yours to edit"
          message="Only the author can change the title or story of a post."
        />
      </div>
    );
  }

  return (
    <div className="edit-post">
      <Link to={`/posts/${postId}`} className="back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to the post
      </Link>

      <PageHeader
        eyebrow="Revise"
        title={
          <>
            Edit the <em>entry.</em>
          </>
        }
        description="Refine the title or story. Images are locked once a post is published."
      />

      <div className="edit-layout">
        <form className="settings-card" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field
            label="Title"
            htmlFor="edit-title"
            error={errors.title?.message}
            hint="Up to 200 characters."
          >
            <TextInput
              id="edit-title"
              type="text"
              maxLength={200}
              placeholder="The title"
              invalid={Boolean(errors.title)}
              {...register('title')}
            />
            <span className="field__counter">{title.length}/200</span>
          </Field>

          <Field
            label="Story"
            htmlFor="edit-content"
            error={errors.content?.message}
            hint="Your edits replace the published story immediately."
          >
            <TextArea
              id="edit-content"
              rows={10}
              placeholder="The story"
              invalid={Boolean(errors.content)}
              {...register('content')}
            />
            <span className="field__counter">{content.trim().length.toLocaleString()} characters</span>
          </Field>

          <div className="edit-post__images">
            <p className="field__label">Attached images</p>
            {post.images?.length ? (
              <div className="edit-post__thumbs">
                {post.images.map((image, index) => (
                  <img
                    key={image.publicId || image.url}
                    src={image.url}
                    alt={`Attached image ${index + 1}`}
                  />
                ))}
              </div>
            ) : (
              <p className="edit-post__noimages">
                <ImageOff size={15} aria-hidden="true" />
                This post has no images.
              </p>
            )}
            <p className="field__hint">
              The current API updates text only; images cannot be added or removed here.
            </p>
          </div>

          {serverError ? (
            <p className="form-alert" role="alert">
              {serverError}
            </p>
          ) : null}

          <div className="settings-actions">
            <Link to={`/posts/${postId}`} className="btn btn--ghost btn--md">
              Cancel
            </Link>
            <Button
              type="submit"
              loading={saving}
              disabled={!isDirty || !title.trim() || !content.trim()}
              leadingIcon={<Save size={15} aria-hidden="true" />}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>

        <aside className="settings-aside">
          <div className="rail-card">
            <p className="eyebrow">Editing note</p>
            <p className="rail-card__copy">
              Saving updates the post’s modified date, which appears as “Edited” beside your name.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
