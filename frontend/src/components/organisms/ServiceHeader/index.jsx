import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import Badge from '@/components/atoms/Badge/index.jsx';
import './serviceHeader.scss';

export default function ServiceHeader({
  title,
  subtitle,
  badgeLabel,
  badgeTone = 'info',
  cityLabel = 'City',
  cityName,
  priceLabel = 'Starting at',
  priceCurrency = 'INR',
  priceAmount,
  pricePeriod = 'per shipment',
  className = '',
}) {
  return (
    <section className={['service-header', className].filter(Boolean).join(' ')}>
      <div className="service-header__content">
        {badgeLabel ? <Badge label={badgeLabel} tone={badgeTone} /> : null}
        <Heading level={1} className="service-header__title">
          {title}
        </Heading>
        {subtitle ? (
          <Text size="lg" className="service-header__subtitle">
            {subtitle}
          </Text>
        ) : null}
      </div>

      <div className="service-header__meta">
        <div className="service-header__meta-card">
          <Text size="xs" weight="medium" className="service-header__meta-label">
            {cityLabel}
          </Text>
          <Text size="lg" weight="bold">
            {cityName}
          </Text>
        </div>

        <div className="service-header__meta-card service-header__meta-card--price">
          <Text size="xs" weight="medium" className="service-header__meta-label">
            {priceLabel}
          </Text>
          <div className="service-header__price">
            <span className="service-header__price-currency">{priceCurrency}</span>
            <span className="service-header__price-amount">{priceAmount}</span>
            <span className="service-header__price-period">{pricePeriod}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

