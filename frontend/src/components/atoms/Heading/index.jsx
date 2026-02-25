import './heading.scss';

const levelSizes = {
  1: 'xl',
  2: 'lg',
  3: 'md',
  4: 'sm',
  5: 'xs',
  6: 'xs',
};

export default function Heading({
  level = 1,
  size,
  children,
  className = '',
  ...props
}) {
  const Tag = `h${Math.min(Math.max(level, 1), 6)}`;
  const resolvedSize = size || levelSizes[level] || 'md';

  const classes = ['ui-heading', `ui-heading--${resolvedSize}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
