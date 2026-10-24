import { AlertTriangle, RotateCw } from 'lucide-react';
import Button from './Button.jsx';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this just now.',
  onRetry,
  retryLabel = 'Try again',
  compact = false,
}) {
  return (
    <div className={`error-state ${compact ? 'error-state--compact' : ''}`} role="alert">
      <span className="error-state__icon" aria-hidden="true">
        <AlertTriangle size={20} />
      </span>
      <div className="error-state__copy">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leadingIcon={<RotateCw size={14} aria-hidden="true" />}
        >
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
