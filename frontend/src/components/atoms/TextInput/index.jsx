import FormField from '@/components/atoms/FormField/index.jsx';

export default function TextInput({
  id,
  label,
  description,
  error,
  required = false,
  className,
  inputClassName,
  type = 'text',
  ...inputProps
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
        <input
          {...inputProps}
          id={controlId}
          type={type}
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
        />
      )}
    </FormField>
  );
}
