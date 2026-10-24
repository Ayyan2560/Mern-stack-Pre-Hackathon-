import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';

export function Field({ label, htmlFor, hint, error, optional, children, className = '' }) {
  return (
    <div className={`field ${error ? 'field--invalid' : ''} ${className}`.trim()}>
      {label && (
        <div className="field__top">
          <label className="field__label" htmlFor={htmlFor}>
            {label}
          </label>
          {optional && <span className="field__optional">Optional</span>}
        </div>
      )}
      {children}
      {error ? (
        <p className="field__error" id={htmlFor ? `${htmlFor}-error` : undefined} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field__hint">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({ icon, invalid = false, className = '', ...props }) {
  return (
    <div className={`input-shell ${invalid ? 'input-shell--invalid' : ''} ${className}`.trim()}>
      {icon ? <span className="input-shell__icon">{icon}</span> : null}
      <input className="input-shell__input" {...props} />
    </div>
  );
}

export function TextArea({ invalid = false, className = '', ...props }) {
  return (
    <div className={`input-shell input-shell--area ${invalid ? 'input-shell--invalid' : ''} ${className}`.trim()}>
      <textarea className="input-shell__input" {...props} />
    </div>
  );
}

export function PasswordInput({ invalid = false, className = '', ...props }) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className={`input-shell ${invalid ? 'input-shell--invalid' : ''} ${className}`.trim()}>
      <input
        id={props.id || id}
        className="input-shell__input"
        type={visible ? 'text' : 'password'}
        {...props}
      />
      <button
        type="button"
        className="input-shell__toggle"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
