import { useState } from 'react';
import { getInitials, displayName, profilePictureUrl } from '../../utils/format.js';

const TONES = ['sand', 'clay', 'olive', 'slate', 'plum', 'umber'];

function toneFor(name) {
  let hash = 0;
  const value = typeof name === 'string' ? name : 'Aurel';
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 997;
  }
  return TONES[hash % TONES.length];
}

export default function Avatar({
  user,
  size = 'md',
  className = '',
  alt,
  ring = false,
}) {
  // Track which URL failed rather than a boolean, so a changed avatar
  // recovers automatically without a reset effect.
  const [failedUrl, setFailedUrl] = useState(null);
  const url = profilePictureUrl(user);
  const name = displayName(user);
  const failed = Boolean(url) && failedUrl === url;

  const classes = ['avatar', `avatar--${size}`, ring ? 'avatar--ring' : '', className]
    .filter(Boolean)
    .join(' ');

  if (url && !failed) {
    return (
      <span className={classes}>
        <img
          src={url}
          alt={alt || `${name}'s profile photo`}
          onError={() => setFailedUrl(url)}
          loading="lazy"
        />
      </span>
    );
  }

  return (
    <span
      className={`${classes} avatar--initial avatar--tone-${toneFor(name)}`}
      aria-label={alt || name}
      role="img"
    >
      <span aria-hidden="true">{getInitials(name)}</span>
    </span>
  );
}
