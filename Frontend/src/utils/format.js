const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const monthYearFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
});

const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
});

export function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function timeAgo(value) {
  const date = toDate(value);
  if (!date) return '';

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);

  if (seconds < 45) return 'just now';
  if (seconds < 90) return '1 min ago';

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  if (date.getFullYear() === new Date().getFullYear()) {
    return shortDateFormatter.format(date);
  }

  return dateFormatter.format(date);
}

export function formatDate(value) {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : '';
}

export function formatFullDate(value) {
  const date = toDate(value);
  return date ? fullDateFormatter.format(date) : '';
}

export function formatMonthYear(value) {
  const date = toDate(value);
  return date ? monthYearFormatter.format(date) : '';
}

export function getInitials(name) {
  if (typeof name !== 'string') return 'A';

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'A';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function userIdOf(user) {
  return user?._id || user?.id || null;
}

export function displayName(user) {
  if (!user) return 'Unknown member';
  if (typeof user === 'string') return 'Member';
  return user.name?.trim() || 'Unknown member';
}

export function profilePictureUrl(user) {
  return user?.profilePicture?.url || '';
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function isEdited(post) {
  if (!post?.createdAt || !post?.updatedAt) return false;
  return new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 2000;
}

export function truncate(text, max = 480) {
  if (typeof text !== 'string') return '';
  if (text.length <= max) return { text, truncated: false };
  return { text: text.slice(0, max).trimEnd(), truncated: true };
}

export function readingTime(text) {
  const words = typeof text === 'string' ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(words / 220));
}
