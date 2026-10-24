import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import ImageLightbox from '../ui/ImageLightbox.jsx';

export default function PostGallery({ images = [], title = 'Post' }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [failed, setFailed] = useState({});

  if (!images.length) return null;

  const visible = images.slice(0, 4);
  const remaining = images.length - visible.length;
  const lightboxImages = images.map((image, index) => ({
    url: image.url,
    alt: `${title} — image ${index + 1}`,
    caption: images.length > 1 ? `${title} — ${index + 1} of ${images.length}` : title,
  }));

  return (
    <>
      <div className={`gallery gallery--${visible.length}`} data-count={images.length}>
        {visible.map((image, index) => (
          <button
            key={image._id || image.url}
            type="button"
            className={`gallery__tile gallery__tile--${index + 1}`}
            onClick={() => setLightboxIndex(index)}
            aria-label={`Open image ${index + 1} of ${images.length}`}
          >
            {failed[image.url] ? (
              <span className="gallery__fallback">
                <ImageOff size={22} aria-hidden="true" />
                <span>Image unavailable</span>
              </span>
            ) : (
              <img
                src={image.url}
                alt=""
                loading="lazy"
                onError={() => setFailed((state) => ({ ...state, [image.url]: true }))}
              />
            )}
            {remaining > 0 && index === visible.length - 1 ? (
              <span className="gallery__more">+{remaining}</span>
            ) : null}
          </button>
        ))}
      </div>

      <ImageLightbox
        open={lightboxIndex !== null}
        index={lightboxIndex ?? 0}
        images={lightboxImages}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
