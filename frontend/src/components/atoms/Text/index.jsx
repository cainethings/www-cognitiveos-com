import './text.scss';

export default function Text({
  as: Component = 'p',
  size = 'md',
  weight = 'regular',
  children,
  className = '',
  ...props
}) {
  const classes = [
    'ui-text',
    `ui-text--${size}`,
    `ui-text--${weight}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
