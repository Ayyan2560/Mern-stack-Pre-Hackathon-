import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { createPost } from '../../features/posts/postsSlice.mjs';
import { postSchema } from '../../schemas/index.js';
import { MAX_GALLERY_IMAGES } from '../../utils/constants.js';
import { formatFileSize, releasePreview, validateImageFiles } from '../../utils/media.js';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import { Field, TextArea, TextInput } from '../ui/Field.jsx';

export default function PostComposer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const fileInputRef = useRef(null);
  const previewsRef = useRef([]);

  const [images, setImages] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: { title: '', content: '' },
  });

  const title = watch('title') || '';
  const content = watch('content') || '';

  useEffect(() => {
    previewsRef.current = images;
  }, [images]);

  useEffect(
    () => () => {
      previewsRef.current.forEach((image) => releasePreview(image.preview));
    },
    []
  );

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    const { accepted, errors: fileErrors } = validateImageFiles(incoming, images.length);

    if (fileErrors.length) {
      fileErrors.slice(0, 2).forEach((message) => toast.error(message));
    }

    if (!accepted.length) return;

    setImages((current) => [
      ...current,
      ...accepted.map((file) => ({
        key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeImage = (key) => {
    setImages((current) => {
      const target = current.find((image) => image.key === key);
      if (target) releasePreview(target.preview);
      return current.filter((image) => image.key !== key);
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const onSubmit = async (values) => {
    if (submitting) return;
    setSubmitting(true);
    setServerError('');

    const formData = new FormData();
    formData.append('title', values.title.trim());
    formData.append('content', values.content.trim());
    images.forEach((image) => formData.append('images', image.file));

    try {
      const result = await dispatch(createPost(formData)).unwrap();
      toast.success('Your post is live.');
      navigate(`/posts/${result.post._id}`, { replace: true });
    } catch (error) {
      const message =
        typeof error === 'string' ? error : 'Could not publish your post.';
      setServerError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="composer" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="composer__byline">
        <Avatar user={user} size="md" />
        <div>
          <p className="composer__byline-label">Publishing as</p>
          <p className="composer__byline-name">{user?.name}</p>
        </div>
        <span className="composer__visibility">Public journal</span>
      </div>

      <Field
        label="Title"
        htmlFor="post-title"
        error={errors.title?.message}
        hint="A short, evocative line. Up to 200 characters."
      >
        <TextInput
          id="post-title"
          type="text"
          placeholder="Give your story a title"
          maxLength={200}
          invalid={Boolean(errors.title)}
          {...register('title')}
        />
        <span className="field__counter">{title.length}/200</span>
      </Field>

      <Field
        label="Story"
        htmlFor="post-content"
        error={errors.content?.message}
        hint="Write freely. You can refine the wording later."
      >
        <TextArea
          id="post-content"
          rows={7}
          placeholder="What is worth sharing today?"
          invalid={Boolean(errors.content)}
          {...register('content')}
        />
        <span className="field__counter">{content.trim().length.toLocaleString()} characters</span>
      </Field>

      <div className="upload">
        <div className="upload__head">
          <span className="field__label">Images</span>
          <span className="upload__count">
            {images.length}/{MAX_GALLERY_IMAGES}
          </span>
        </div>

        {images.length ? (
          <div className="upload__grid">
            {images.map((image, index) => (
              <figure className="upload__item" key={image.key}>
                <img src={image.preview} alt={`Selected image ${index + 1}`} />
                <figcaption>{formatFileSize(image.file.size)}</figcaption>
                <button
                  type="button"
                  className="upload__remove"
                  onClick={() => removeImage(image.key)}
                  aria-label={`Remove ${image.file.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </figure>
            ))}

            {images.length < MAX_GALLERY_IMAGES ? (
              <button
                type="button"
                className="upload__add"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus size={20} aria-hidden="true" />
                <span>Add</span>
              </button>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            className={`dropzone ${dragging ? 'is-dragging' : ''}`.trim()}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <span className="dropzone__icon">
              <UploadCloud size={22} aria-hidden="true" />
            </span>
            <span className="dropzone__title">Drop images here, or browse</span>
            <span className="dropzone__hint">JPG, PNG or WebP · up to 5 images · 5 MB each</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
          aria-label="Choose images to upload"
        />

        {images.length ? <p className="upload__note">Images are attached when you publish.</p> : null}
      </div>

      {serverError ? (
        <p className="form-alert" role="alert">
          {serverError}
        </p>
      ) : null}

      <div className="composer__actions">
        <Link to="/" className="btn btn--ghost btn--md">
          Cancel
        </Link>
        <Button
          type="submit"
          size="lg"
          loading={submitting}
          disabled={!title.trim() || !content.trim()}
        >
          {submitting ? 'Publishing…' : 'Publish post'}
        </Button>
      </div>

      {submitting ? (
        <p className="composer__publishing" role="status">
          <Loader2 className="spin" size={14} aria-hidden="true" />
          Uploading {images.length ? `${images.length} image${images.length === 1 ? '' : 's'} and ` : ''}
          publishing your story…
        </p>
      ) : null}
    </form>
  );
}
