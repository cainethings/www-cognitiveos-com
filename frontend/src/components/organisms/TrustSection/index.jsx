import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import Icon from '@/components/atoms/Icon/index.jsx';
import './trustSection.scss';

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
    '--trust-accent': normalizeHexColor(accent),
    '--trust-accent-soft': `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.18)`,
    '--trust-accent-faint': `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.05)`,
  };
};

export default function TrustSection({
  title = 'Trust signals',
  subtitle,
  indicators = [],
  className = '',
}) {
  if (!indicators.length) return null;

  return (
    <section className={['trust-section', className].filter(Boolean).join(' ')}>
      <header className="trust-section__header">
        <Heading level={2}>{title}</Heading>
        {subtitle ? (
          <Text size="lg" className="trust-section__subtitle">
            {subtitle}
          </Text>
        ) : null}
      </header>

      <div className="trust-section__grid" aria-label={title}>
        {indicators.map((indicator) => (
          <article
            key={indicator.id || indicator.label}
            className="trust-card"
            style={buildAccentVars(indicator.accent)}
          >
            <div className="trust-card__header">
              <div className="trust-card__icon">
                <Icon name={indicator.icon || 'check'} size={18} />
              </div>
              {indicator.tag ? (
                <Text size="xs" weight="medium" className="trust-card__tag">
                  {indicator.tag}
                </Text>
              ) : null}
            </div>

            <div className="trust-card__value">{indicator.value}</div>
            <Heading level={3} size="sm" className="trust-card__label">
              {indicator.label}
            </Heading>
            {indicator.description ? (
              <Text size="sm" className="trust-card__description">
                {indicator.description}
              </Text>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

