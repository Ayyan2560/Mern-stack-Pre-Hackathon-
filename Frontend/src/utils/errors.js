import axios from 'axios';

/**
 * Converts any thrown value into a message that is safe (and useful) to show.
 * The backend consistently responds with { success: false, message }.
 */
export function getErrorMessage(
  error,
  fallback = 'Something went wrong. Please try again.'
) {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'The request took too long. Please check your connection and try again.';
    }

    if (!error.response) {
      return 'We could not reach the server. Check your connection and try again.';
    }

    const data = error.response.data;

    if (typeof data === 'string' && data.trim() && !data.includes('<')) {
      return data.trim();
    }

    if (data && typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (data && Array.isArray(data.errors) && data.errors.length) {
      const first = data.errors[0];
      return typeof first === 'string' ? first : first?.message || fallback;
    }

    switch (error.response.status) {
      case 400:
        return 'The request was not valid. Please check the details and try again.';
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to do that.';
      case 404:
        return 'We could not find what you were looking for.';
      case 409:
        return 'That already exists.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      default:
        return fallback;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getStatusCode(error) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export function isCanceled(error) {
  return axios.isCancel(error) || error?.code === 'ERR_CANCELED';
}
