import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import Button from '@/components/atoms/Button/index.jsx';
import Icon from '@/components/atoms/Icon/index.jsx';
import './heroCarousel.scss';

const wrapIndex = (value, length) => {
  if (!length) return 0;
  return ((value % length) + length) % length;
};

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

const resolveActionLabel = (action) => {
  if (!action) return '';
  return typeof action === 'string' ? action : action.label;
};

const resolveAction = (action) => {
  if (!action) return null;
  return typeof action === 'string' ? { label: action } : action;
};

export default function HeroCarousel({
  slides = [],
  ariaLabel = 'Hero highlights',
  previousLabel = 'Previous slide',
  nextLabel = 'Next slide',
  getDotLabel,
  className = '',
  initialIndex = 0,
}) {
  const navigate = useNavigate();
  const viewportId = useId();
  const [activeIndex, setActiveIndex] = useState(() =>
    slides.length ? wrapIndex(initialIndex, slides.length) : 0
  );

  useEffect(() => {
    if (!slides.length) return;
    setActiveIndex((current) => wrapIndex(current, slides.length));
  }, [slides.length]);

  const resolvedDotLabel =
    getDotLabel || ((index) => `Go to slide ${index + 1}`);

  const goTo = (index) => {
    if (slides.length < 2) return;
    setActiveIndex(wrapIndex(index, slides.length));
  };

  const goNext = () => goTo(activeIndex + 1);
  const goPrev = () => goTo(activeIndex - 1);

  const handleKeyDown = (event) => {
    if (slides.length < 2) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    }
  };

  const handleActionClick = (action) => {
    const resolved = resolveAction(action);
    if (!resolved) return;

    if (resolved.onClick) {
      resolved.onClick();
      return;
    }

    if (resolved.to) {
      navigate(resolved.to);
      return;
    }

    if (resolved.href) {
      const target = resolved.target || '_self';
      if (target === '_blank') {
        window.open(resolved.href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.assign(resolved.href);
      }
    }
  };

  if (!slides.length) return null;

  return (
    <section
      className={['hero-carousel', className].filter(Boolean).join(' ')}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="hero-carousel__viewport" id={viewportId}>
        <div
          className="hero-carousel__track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide, index) => {
            const primaryAction = resolveAction(slide.primaryAction);
            const secondaryAction = resolveAction(slide.secondaryAction);
            const slideLabel = slide.slideLabel || `${index + 1} of ${slides.length}`;
            const accent = hexToRgbTuple(slide.accent);
            const accentVars = accent
              ? {
                  '--hero-accent': normalizeHexColor(slide.accent),
                  '--hero-accent-soft': `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.18)`,
                  '--hero-accent-faint': `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.03)`,
                }
              : undefined;

            return (
              <article
                key={slide.id || slideLabel}
                className="hero-carousel__slide"
                aria-roledescription="slide"
                aria-label={slideLabel}
                aria-hidden={index !== activeIndex}
                style={accentVars}
              >
                <div className="hero-carousel__slide-inner">
                  <div className="hero-carousel__content">
                    {slide.eyebrow ? (
                      <Text
                        as="p"
                        size="sm"
                        weight="medium"
                        className="hero-carousel__eyebrow"
                      >
                        {slide.eyebrow}
                      </Text>
                    ) : null}

                    <Heading level={1} className="hero-carousel__title">
                      {slide.title}
                    </Heading>

                    {slide.subtitle ? (
                      <Text size="lg" className="hero-carousel__subtitle">
                        {slide.subtitle}
                      </Text>
                    ) : null}

                    {Array.isArray(slide.bullets) && slide.bullets.length ? (
                      <ul className="hero-carousel__bullets">
                        {slide.bullets.map((bullet, bulletIndex) => (
                          <li
                            key={`${bulletIndex}-${bullet}`}
                            className="hero-carousel__bullet"
                          >
                            <Icon
                              name="check"
                              size={18}
                              className="hero-carousel__bullet-icon"
                            />
                            <Text as="span" size="sm">
                              {bullet}
                            </Text>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {primaryAction || secondaryAction ? (
                      <div className="hero-carousel__cta">
                        {primaryAction ? (
                          <Button
                            size="lg"
                            variant={primaryAction.variant || 'primary'}
                            onClick={() => handleActionClick(primaryAction)}
                          >
                            {resolveActionLabel(primaryAction)}
                          </Button>
                        ) : null}

                        {secondaryAction ? (
                          <Button
                            size="lg"
                            variant={secondaryAction.variant || 'secondary'}
                            onClick={() => handleActionClick(secondaryAction)}
                          >
                            {resolveActionLabel(secondaryAction)}
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="hero-carousel__media">
                    {slide.media ? (
                      slide.media
                    ) : (
                      <div
                        className="hero-carousel__media-placeholder"
                        aria-hidden="true"
                      >
                        <div className="hero-carousel__media-glow" />
                        <div className="hero-carousel__media-card">
                          <span className="hero-carousel__media-label">
                            {slide.mediaLabel || 'SwadesiConnection'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="hero-carousel__controls">
          <Button
            variant="secondary"
            size="sm"
            className="hero-carousel__nav"
            aria-controls={viewportId}
            aria-label={previousLabel}
            onClick={goPrev}
          >
            Prev
          </Button>

          <div className="hero-carousel__dots" aria-label="Carousel pagination">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={slide.id || `${index}`}
                  type="button"
                  className={`hero-carousel__dot${
                    isActive ? ' hero-carousel__dot--active' : ''
                  }`}
                  aria-label={resolvedDotLabel(index)}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => goTo(index)}
                />
              );
            })}
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="hero-carousel__nav"
            aria-controls={viewportId}
            aria-label={nextLabel}
            onClick={goNext}
          >
            Next
          </Button>
        </div>
      ) : null}
    </section>
  );
}
