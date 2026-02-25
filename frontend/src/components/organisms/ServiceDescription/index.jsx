import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import Icon from '@/components/atoms/Icon/index.jsx';
import './serviceDescription.scss';

export default function ServiceDescription({
  title = 'Service description',
  subtitle,
  description,
  requirementsTitle = 'Requirements',
  requirements = [],
  durationLabel = 'Duration',
  durationValue,
  durationNote,
  className = '',
}) {
  return (
    <section className={['service-description', className].filter(Boolean).join(' ')}>
      <div className="service-description__content">
        <header className="service-description__header">
          <Heading level={2}>{title}</Heading>
          {subtitle ? (
            <Text size="lg" className="service-description__subtitle">
              {subtitle}
            </Text>
          ) : null}
        </header>

        {description ? (
          <Text className="service-description__body">{description}</Text>
        ) : null}

        {requirements.length ? (
          <div className="service-description__requirements">
            <Heading level={3} size="sm">
              {requirementsTitle}
            </Heading>
            <ul className="service-description__list">
              {requirements.map((item, index) => (
                <li key={`${index}-${item}`} className="service-description__list-item">
                  <span className="service-description__list-icon" aria-hidden="true">
                    <Icon name="check" size={16} />
                  </span>
                  <Text as="span" size="sm">
                    {item}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <aside className="service-description__aside">
        <div className="service-description__duration">
          <Text size="xs" weight="medium" className="service-description__duration-label">
            {durationLabel}
          </Text>
          <div className="service-description__duration-value">{durationValue}</div>
          {durationNote ? (
            <Text size="sm" className="service-description__duration-note">
              {durationNote}
            </Text>
          ) : null}
        </div>
      </aside>
    </section>
  );
}

