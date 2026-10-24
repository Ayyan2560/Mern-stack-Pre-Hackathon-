import { useRef } from 'react';

export default function OtpInput({ value = '', onChange, disabled = false, length = 6 }) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, index) => value[index] || '');

  const updateAt = (index, digit) => {
    const next = value.split('');
    next[index] = digit;
    onChange(next.join('').slice(0, length));
  };

  const focusAt = (index) => {
    const target = refs.current[Math.max(0, Math.min(length - 1, index))];
    target?.focus();
    target?.select?.();
  };

  const handleChange = (index, raw) => {
    const clean = raw.replace(/\D/g, '');

    if (!clean) {
      updateAt(index, '');
      return;
    }

    if (clean.length > 1) {
      const chars = clean.slice(0, length - index).split('');
      const next = value.split('');
      chars.forEach((char, offset) => {
        next[index + offset] = char;
      });
      onChange(next.join('').slice(0, length));
      focusAt(index + chars.length);
      return;
    }

    updateAt(index, clean);
    focusAt(index + 1);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        updateAt(index, '');
      } else if (index > 0) {
        updateAt(index - 1, '');
        focusAt(index - 1);
        event.preventDefault();
      }
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusAt(pasted.length);
  };

  return (
    <div className="otp" role="group" aria-label="6-digit verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          className="otp__box"
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          aria-label={`Digit ${index + 1} of ${length}`}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
