import { useId } from 'react';
import './checkboxField.scss';

export default function CheckboxField({
  id,
  label,
  description,
  error,
  required = false,
  className,
  inputClassName,
  ...inputProps
}) {
  const reactId = useId();
  const controlId = id || `checkbox-${reactId}`;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;
  const invalid = Boolean(error);

  return (
    <div className={`checkbox-field${className ? ` ${className}` : ''}`}>
      <div className="checkbox-field__row">
        <input
          {...inputProps}
          id={controlId}
          type="checkbox"
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={[
            'checkbox-field__input',
            invalid ? 'checkbox-field__input--invalid' : '',
            inputClassName || '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {label ? (
          <label className="checkbox-field__label" htmlFor={controlId}>
            {label}
            {required ? <span className="checkbox-field__required">*</span> : null}
          </label>
        ) : null}
      </div>

      {description ? (
        <p className="checkbox-field__description" id={descriptionId}>
          {description}
        </p>
      ) : null}

      {error ? (
        <p className="checkbox-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
