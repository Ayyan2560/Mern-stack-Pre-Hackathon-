import { MAX_GALLERY_IMAGES, MAX_IMAGE_BYTES } from './constants.js';

export function isImageFile(file) {
  return Boolean(file && typeof file.type === 'string' && file.type.startsWith('image/'));
}

/**
 * Validates files before they are previewed or uploaded.
 * Mirrors the backend constraints: images only, 5 MB or less, at most 5 total.
 */
export function validateImageFiles(files, existingCount = 0) {
  const accepted = [];
  const errors = [];
  let count = existingCount;

  for (const file of files) {
    if (!isImageFile(file)) {
      errors.push(`${file.name} is not an image.`);
      continue;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      errors.push(`${file.name} is larger than 5 MB.`);
      continue;
    }

    if (count >= MAX_GALLERY_IMAGES) {
      errors.push(`You can add up to ${MAX_GALLERY_IMAGES} images.`);
      break;
    }

    accepted.push(file);
    count += 1;
  }

  return { accepted, errors };
}

export function createPreview(file) {
  return URL.createObjectURL(file);
}

export function releasePreview(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
