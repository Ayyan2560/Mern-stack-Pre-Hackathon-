export function postUrl(postId) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/posts/${postId}`;
}

export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to a temporary textarea below.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

/**
 * Uses the native share sheet when available, otherwise copies the link.
 * Returns: 'shared' | 'copied' | 'cancelled' | 'failed'
 */
export async function shareOrCopy(post) {
  const url = postUrl(post?._id);
  if (!url) return 'failed';

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: post?.title || 'Aurel post',
        text: post?.title ? `${post.title} — on Aurel` : 'A post on Aurel',
        url,
      });
      return 'shared';
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled';
    }
  }

  const copied = await copyToClipboard(url);
  return copied ? 'copied' : 'failed';
}
