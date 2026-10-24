import { useEffect } from 'react';
import { APP_NAME } from '../utils/constants.js';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${APP_NAME}` : `${APP_NAME} — The Social Atelier`;
  }, [title]);
}
