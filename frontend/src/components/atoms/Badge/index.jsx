import Icon from '@/components/atoms/Icon/index.jsx';
import './badge.scss';

export default function Badge({
  label,
  subLabel,
  variant = 'simple',
  tone = 'neutral',
  icon,
  className = '',
}) {
  const classes = [
    'ui-badge',
    `ui-badge--${variant}`,
    `ui-badge--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {icon ? <Icon name={icon} size={14} className="ui-badge__icon" /> : null}
      <span className="ui-badge__label">{label}</span>
      {variant === 'complex' && subLabel ? (
        <span className="ui-badge__sub">{subLabel}</span>
      ) : null}
    </span>
  );
}
