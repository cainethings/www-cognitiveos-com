import { useId } from 'react';
import './formField.scss';

export default function FormField({
  id,
  label,
  labelFor = true,
  description,
  error,
  required = false,
  className,
  children,
}) {
  const reactId = useId();
  const fieldId = id || `field-${reactId}`;
  const labelId = `${fieldId}-label`;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(' ') || undefined;
  const invalid = Boolean(error);

  return (
    <div className={`form-field${className ? ` ${className}` : ''}`}>
      {label ? (
        labelFor ? (
          <label className="form-field__label" id={labelId} htmlFor={fieldId}>
            {label}
            {required ? <span className="form-field__required">*</span> : null}
          </label>
        ) : (
          <p className="form-field__label" id={labelId}>
            {label}
            {required ? <span className="form-field__required">*</span> : null}
          </p>
        )
      ) : null}

      {typeof children === 'function'
        ? children({
            id: fieldId,
            labelId,
            describedBy,
            invalid,
          })
        : children}

      {description ? (
        <p className="form-field__description" id={descriptionId}>
          {description}
        </p>
      ) : null}

      {error ? (
        <p className="form-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
