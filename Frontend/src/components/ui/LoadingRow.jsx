import { Loader2 } from 'lucide-react';

export default function LoadingRow({ label = 'Loading' }) {
  return (
    <div className="loading-row" role="status" aria-live="polite">
      <Loader2 className="spin" size={16} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
