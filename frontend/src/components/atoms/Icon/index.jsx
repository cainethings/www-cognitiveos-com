import './icon.scss';

const icons = {
  plus: (
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  dots: (
    <>
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
    </>
  ),
  check: (
    <path
      d="M5 12l4 4 10-10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  star: (
    <path
      d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6-4.4-4.3 6.1-.9z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="none"
    />
  ),
};

export default function Icon({ name, size = 20, title, className = '', ...props }) {
  const glyph = icons[name];
  if (!glyph) return null;

  const classes = ['ui-icon', className].filter(Boolean).join(' ');
  const ariaHidden = title ? undefined : true;

  return (
    <svg
      className={classes}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={title ? 'img' : 'presentation'}
      aria-hidden={ariaHidden}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {glyph}
    </svg>
  );
}
