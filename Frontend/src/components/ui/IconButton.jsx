import { Loader2 } from 'lucide-react';

export default function IconButton({
  label,
  children,
  className = '',
  loading = false,
  variant = 'ghost',
  size = 'md',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={['icon-btn', `icon-btn--${variant}`, `icon-btn--${size}`, className]
        .filter(Boolean)
        .join(' ')}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <Loader2 className="spin" size={18} aria-hidden="true" /> : children}
    </button>
  );
}
