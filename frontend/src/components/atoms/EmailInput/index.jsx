import TextInput from '@/components/atoms/TextInput/index.jsx';

export default function EmailInput(props) {
  return (
    <TextInput
      {...props}
      type="email"
      autoComplete={props.autoComplete ?? 'email'}
      inputMode={props.inputMode ?? 'email'}
    />
  );
}
