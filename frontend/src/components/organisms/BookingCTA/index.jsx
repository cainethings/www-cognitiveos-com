import { useNavigate } from 'react-router-dom';
import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import Button from '@/components/atoms/Button/index.jsx';
import './bookingCta.scss';

export default function BookingCTA({
  title = 'Ready to book?',
  subtitle,
  priceLabel = 'Starting at',
  priceCurrency = 'INR',
  priceAmount,
  pricePeriod,
  actionLabel = 'Book now',
  actionTo,
  onAction,
  className = '',
}) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
      return;
    }
    if (actionTo) {
      navigate(actionTo);
    }
  };

  return (
    <section className={['booking-cta', className].filter(Boolean).join(' ')}>
      <div className="booking-cta__content">
        <Heading level={3} size="sm">
          {title}
        </Heading>
        {subtitle ? (
          <Text size="sm" className="booking-cta__subtitle">
            {subtitle}
          </Text>
        ) : null}
      </div>

      <div className="booking-cta__meta">
        <div className="booking-cta__price">
          <Text size="xs" weight="medium" className="booking-cta__price-label">
            {priceLabel}
          </Text>
          <div className="booking-cta__price-row">
            <span className="booking-cta__price-currency">{priceCurrency}</span>
            <span className="booking-cta__price-amount">{priceAmount}</span>
            {pricePeriod ? (
              <span className="booking-cta__price-period">{pricePeriod}</span>
            ) : null}
          </div>
        </div>
        <Button size="sm" onClick={handleAction} disabled={!onAction && !actionTo}>
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}

