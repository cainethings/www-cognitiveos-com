import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import Button from '@/components/atoms/Button/index.jsx';
import './categoryCard.scss';

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

export default function CategoryCard({
  title,
  description,
  ctaLabel = 'Explore',
  to,
  href,
  target,
  accent,
  onCtaClick,
  className = '',
}) {
  const navigate = useNavigate();

  const badgeText = title ? String(title).trim().slice(0, 1).toUpperCase() : '?';
  const accentVars = useMemo(() => {
    const accentRgb = hexToRgbTuple(accent);
    if (!accentRgb) return undefined;

    const resolvedHex = normalizeHexColor(accent);
    return {
      '--category-accent': resolvedHex,
      '--category-accent-soft': `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.14)`,
      '--category-accent-faint': `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.04)`,
    };
  }, [accent]);

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
      return;
    }

    if (to) {
      navigate(to);
      return;
    }

    if (href) {
      const resolvedTarget = target || '_self';
      if (resolvedTarget === '_blank') {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.assign(href);
      }
    }
  };

  const isDisabled = !onCtaClick && !to && !href;

  return (
    <article
      className={['category-card', className].filter(Boolean).join(' ')}
      style={accentVars}
    >
      <div className="category-card__header">
        <div className="category-card__badge" aria-hidden="true">
          {badgeText}
        </div>
        <Heading level={3} size="sm" className="category-card__title">
          {title}
        </Heading>
      </div>

      {description ? (
        <Text size="sm" className="category-card__description">
          {description}
        </Text>
      ) : null}

      <div className="category-card__footer">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCtaClick}
          disabled={isDisabled}
        >
          {ctaLabel}
        </Button>
      </div>
    </article>
  );
}

