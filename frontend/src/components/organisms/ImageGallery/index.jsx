import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import './imageGallery.scss';

const normalizeHexColor = (value) => {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (!/^#([0-9a-fA-F]{6})$/.test(normalized)) return null;
  return normalized.toLowerCase();
};

const hexToRgbTuple = (value) => {
  const hex = normalizeHexColor(value);
  if (!hex) return null;

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return [r, g, b];
};

const buildAccentVars = (accent) => {
  const accentRgb = hexToRgbTuple(accent);
  if (!accentRgb) return undefined;

  return {
    '--gallery-accent': normalizeHexColor(accent),
    '--gallery-accent-soft': `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.22)`,
    '--gallery-accent-faint': `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.06)`,
  };
};

export default function ImageGallery({
  title = 'Image gallery',
  subtitle,
  items = [],
  className = '',
}) {
  if (!items.length) return null;

  return (
    <section className={['image-gallery', className].filter(Boolean).join(' ')}>
      <header className="image-gallery__header">
        <Heading level={2}>{title}</Heading>
        {subtitle ? (
          <Text size="lg" className="image-gallery__subtitle">
            {subtitle}
          </Text>
        ) : null}
      </header>

      <div className="image-gallery__grid" aria-label={title}>
        {items.map((item) => (
          <article
            key={item.id || item.title}
            className={[
              'image-gallery__item',
              item.size ? `image-gallery__item--${item.size}` : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={buildAccentVars(item.accent)}
          >
            <div className="image-gallery__media" role="img" aria-label={item.title}>
              <div className="image-gallery__glow" aria-hidden="true" />
              <div className="image-gallery__frame" aria-hidden="true">
                <span className="image-gallery__frame-label">
                  {item.tag || 'Collection'}
                </span>
              </div>
            </div>

            <div className="image-gallery__content">
              <Heading level={3} size="sm">
                {item.title}
              </Heading>
              {item.description ? (
                <Text size="sm" className="image-gallery__description">
                  {item.description}
                </Text>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

