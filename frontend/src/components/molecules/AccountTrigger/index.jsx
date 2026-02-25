import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button/index.jsx';

export default function AccountTrigger({
  isAuthenticated = false,
  signInLabel = 'Sign in',
  accountLabel = 'Account',
  signInTo = '/auth',
  accountTo = '/account',
  variant = 'primary',
  size = 'sm',
  className = '',
  onClick,
  ...buttonProps
}) {
  const navigate = useNavigate();

  const label = isAuthenticated ? accountLabel : signInLabel;
  const destination = isAuthenticated ? accountTo : signInTo;

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
      return;
    }
    navigate(destination);
  };

  return (
    <Button
      {...buttonProps}
      className={className}
      variant={variant}
      size={size}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}

