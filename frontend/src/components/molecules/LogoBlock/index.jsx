import { Link } from 'react-router-dom';
import './logoBlock.scss';

export default function LogoBlock({
  to = '/',
  src,
  alt,
  brand,
  tagline,
  ariaLabel,
  className = '',
  imageClassName = '',
  textClassName = '',
}) {
  if (!src) return null;

  const hasText = Boolean(brand || tagline);
  const label = ariaLabel || brand || alt || 'Home';
  const imageAlt = hasText ? '' : alt || brand || 'Logo';

  const classes = ['logo-block', className].filter(Boolean).join(' ');
  const imageClasses = ['logo-block__image', imageClassName].filter(Boolean).join(' ');
  const textClasses = ['logo-block__text', textClassName].filter(Boolean).join(' ');

  return (
    <Link to={to} className={classes} aria-label={label}>
      <img className={imageClasses} src={src} alt={imageAlt} />
      {hasText ? (
        <span className={textClasses}>
          {brand ? <span className="logo-block__brand">{brand}</span> : null}
          {tagline ? <span className="logo-block__tagline">{tagline}</span> : null}
        </span>
      ) : null}
    </Link>
  );
}

