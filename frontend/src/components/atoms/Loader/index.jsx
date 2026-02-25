import './loader.scss';

export default function Loader({ size = 36, label = 'Loading', className = '' }) {
  const classes = ['ui-loader', className].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{ '--loader-size': `${size}px` }}
      role="status"
      aria-live="polite"
    >
      <span className="ui-loader__spinner" aria-hidden="true" />
      {label ? <span className="ui-loader__label">{label}</span> : null}
    </div>
  );
}
