import FormField from '@/components/atoms/FormField/index.jsx';

export default function SelectInput({
  id,
  label,
  description,
  error,
  required = false,
  className,
  inputClassName,
  placeholder = 'Select an option',
  options = [],
  children,
  ...selectProps
}) {
  return (
    <FormField
      id={id}
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      {({ id: controlId, describedBy, invalid }) => (
        <select
          {...selectProps}
          id={controlId}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          required={required}
          className={[
            'form-field__control',
            invalid ? 'form-field__control--invalid' : '',
            inputClassName || '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {placeholder ? (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          ) : null}
          {children ||
            options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
        </select>
      )}
    </FormField>
  );
}
