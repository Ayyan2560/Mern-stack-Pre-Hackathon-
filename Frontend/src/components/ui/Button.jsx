import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      className={[
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? 'btn--full' : '',
        loading ? 'is-loading' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Loader2 className="btn__spinner" size={16} aria-hidden="true" />
      ) : (
        leadingIcon || null
      )}
      <span className="btn__label">{children}</span>
      {!loading && trailingIcon ? trailingIcon : null}
    </button>
  );
}
