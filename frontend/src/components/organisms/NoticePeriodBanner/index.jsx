import { useNavigate } from 'react-router-dom';
import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import Icon from '@/components/atoms/Icon/index.jsx';
import Button from '@/components/atoms/Button/index.jsx';
import './noticePeriodBanner.scss';

export default function NoticePeriodBanner({
  title = 'Notice period',
  description,
  periodLabel = 'Notice window',
  periodValue,
  note,
  actionLabel,
  actionTo,
  onAction,
  className = '',
}) {
  const navigate = useNavigate();
  const hasAction = Boolean(actionLabel);
  const isActionDisabled = hasAction && !onAction && !actionTo;

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
    <section className={['notice-banner', className].filter(Boolean).join(' ')}>
      <div className="notice-banner__content">
        <div className="notice-banner__icon" aria-hidden="true">
          <Icon name="star" size={18} />
        </div>
        <div className="notice-banner__copy">
          <Heading level={3} size="sm">
            {title}
          </Heading>
          {description ? (
            <Text size="sm" className="notice-banner__description">
              {description}
            </Text>
          ) : null}
        </div>
      </div>

      <div className="notice-banner__meta">
        <div>
          <Text size="xs" weight="medium" className="notice-banner__label">
            {periodLabel}
          </Text>
          <div className="notice-banner__value">{periodValue}</div>
          {note ? (
            <Text size="xs" className="notice-banner__note">
              {note}
            </Text>
          ) : null}
        </div>
        {hasAction ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAction}
            disabled={isActionDisabled}
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
