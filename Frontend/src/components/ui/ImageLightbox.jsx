import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock.js';
import IconButton from './IconButton.jsx';

export default function ImageLightbox({ images = [], index = 0, open, onClose, onIndexChange }) {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'ArrowRight') onIndexChange?.((index + 1) % images.length);
      if (event.key === 'ArrowLeft') {
        onIndexChange?.((index - 1 + images.length) % images.length);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, index, images.length, onClose, onIndexChange]);

  if (!open || !images.length) return null;

  const image = images[index];

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
      <div className="lightbox__bar">
        <span className="lightbox__count">
          {index + 1} / {images.length}
        </span>
        <IconButton label="Close image viewer" variant="light" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </div>

      <button
        type="button"
        className="lightbox__backdrop"
        aria-label="Close image viewer"
        onClick={onClose}
      />

      <div className="lightbox__stage">
        {images.length > 1 ? (
          <IconButton
            label="Previous image"
            variant="light"
            className="lightbox__nav lightbox__nav--prev"
            onClick={() => onIndexChange?.((index - 1 + images.length) % images.length)}
          >
            <ChevronLeft size={22} />
          </IconButton>
        ) : null}

        <img
          key={image.url}
          src={image.url}
          alt={image.alt || `Image ${index + 1}`}
          className="lightbox__image"
        />

        {images.length > 1 ? (
          <IconButton
            label="Next image"
            variant="light"
            className="lightbox__nav lightbox__nav--next"
            onClick={() => onIndexChange?.((index + 1) % images.length)}
          >
            <ChevronRight size={22} />
          </IconButton>
        ) : null}
      </div>

      {image.caption ? <p className="lightbox__caption">{image.caption}</p> : null}
    </div>,
    document.body
  );
}
