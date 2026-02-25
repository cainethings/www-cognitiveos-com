import { useMemo, useRef, useState } from 'react';
import FormField from '@/components/atoms/FormField/index.jsx';
import './otpInput.scss';

const digitsOnly = (value) => value.replace(/\D/g, '');

export default function OtpInput({
  id,
  label,
  description,
  error,
  required = false,
  length = 6,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  className,
  inputClassName,
  disabled = false,
  ...rest
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const otpValue = isControlled ? value : internalValue;
  const inputsRef = useRef([]);
  const ariaPrefix =
    typeof label === 'string' && label.trim() ? label.trim() : 'OTP';

  const cells = useMemo(() => {
    const normalized = digitsOnly(String(otpValue || '')).slice(0, length);
    return Array.from({ length }, (_, index) => normalized[index] || '');
  }, [otpValue, length]);

  const setValue = (nextValue) => {
    const normalized = digitsOnly(String(nextValue || '')).slice(0, length);
    if (!isControlled) setInternalValue(normalized);
    if (onChange) onChange(normalized);
    if (onComplete && normalized.length === length) onComplete(normalized);
  };

  const focusIndex = (index) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select?.();
    }
  };

  const redirectToFirstEmpty = (index) => {
    if (index <= 0) return;
    const firstEmptyIndex = cells.findIndex((cell) => !cell);
    if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
      focusIndex(firstEmptyIndex);
    }
  };

  const handlePaste = (index, event) => {
    event.preventDefault();
    const paste = digitsOnly(event.clipboardData.getData('text'));
    if (!paste) return;

    const nextCells = [...cells];
    const firstEmptyIndex = nextCells.findIndex((cell) => !cell);
    const startIndex =
      firstEmptyIndex !== -1 && index > firstEmptyIndex ? firstEmptyIndex : index;

    for (let i = 0; i < paste.length && startIndex + i < length; i += 1) {
      nextCells[startIndex + i] = paste[i];
    }

    const nextValue = nextCells.join('');
    setValue(nextValue);

    const nextFocus = Math.min(startIndex + paste.length, length - 1);
    focusIndex(nextFocus);
  };

  const handleInput = (index, rawValue) => {
    const nextChar = digitsOnly(String(rawValue)).slice(-1);
    const nextCells = [...cells];
    nextCells[index] = nextChar;
    const nextValue = nextCells.join('');
    setValue(nextValue);

    if (nextChar && index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      if (cells[index]) {
        const nextCells = [...cells];
        nextCells[index] = '';
        setValue(nextCells.join(''));
        return;
      }
      if (index > 0) {
        focusIndex(index - 1);
        const nextCells = [...cells];
        nextCells[index - 1] = '';
        setValue(nextCells.join(''));
      }
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      focusIndex(index + 1);
      return;
    }

    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
    }
  };

  return (
    <FormField
      id={id}
      label={label}
      labelFor={false}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      {({ id: groupId, labelId, describedBy, invalid }) => (
        <div
          className={`otp-input${invalid ? ' otp-input--invalid' : ''}`}
          role="group"
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          data-disabled={disabled ? 'true' : 'false'}
          {...rest}
        >
          {cells.map((cell, index) => (
            <input
              key={`${groupId}-${index}`}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              className={[
                'otp-input__cell',
                invalid ? 'otp-input__cell--invalid' : '',
                inputClassName || '',
              ]
                .filter(Boolean)
                .join(' ')}
              id={`${groupId}-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              pattern="\\d*"
              maxLength={1}
              value={cell}
              disabled={disabled}
              onPaste={(event) => handlePaste(index, event)}
              onFocus={() => redirectToFirstEmpty(index)}
              onChange={(event) => handleInput(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              aria-label={`${ariaPrefix} digit ${index + 1}`}
            />
          ))}
        </div>
      )}
    </FormField>
  );
}
