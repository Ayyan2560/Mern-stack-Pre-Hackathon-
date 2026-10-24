import { Loader2 } from 'lucide-react';

export default function FullPageLoader({ label = 'Loading' }) {
  return (
    <div className="full-loader" role="status" aria-live="polite">
      <div className="full-loader__mark" aria-hidden="true">
        <span>a</span>
        <Loader2 className="spin" size={18} />
      </div>
      <p>{label}</p>
    </div>
  );
}
