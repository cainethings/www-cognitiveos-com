import { useEffect, useMemo, useState } from 'react';
import PrimaryLayout from '@/layouts/Primary/index.jsx';
import { createTranslator } from '@/translations/index.js';
import ServiceHeader from '@/components/organisms/ServiceHeader/index.jsx';
import ServiceDescription from '@/components/organisms/ServiceDescription/index.jsx';
import NoticePeriodBanner from '@/components/organisms/NoticePeriodBanner/index.jsx';
import BookingCTA from '@/components/organisms/BookingCTA/index.jsx';
import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import { postServiceList } from '@/api.js';
import en from './translations/en.json';
import './page.scss';

const getPreferredLocale = () => {
  if (typeof document !== 'undefined' && document.documentElement?.lang) {
    return document.documentElement.lang.toLowerCase().split('-')[0];
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.toLowerCase().split('-')[0];
  }
  return 'en';
};

const getStoredCity = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('sc_city');
  } catch (error) {
    return null;
  }
};

const formatPriceRange = (priceRange, fallback) => {
  if (!priceRange) return fallback;
  const min = priceRange.min;
  const max = priceRange.max;
  if (min && max && min !== max) {
    return `${min}-${max}`;
  }
  if (min) return `${min}`;
  if (max) return `${max}`;
  return fallback;
};

export default function ServiceDetailPage() {
  const { t } = useMemo(() => createTranslator({ en }), []);
  const locale = useMemo(getPreferredLocale, []);
  const cityName = useMemo(getStoredCity, []);
  const [status, setStatus] = useState('loading');
  const [serviceItem, setServiceItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchService = async () => {
      setStatus('loading');
      setErrorMessage('');

      try {
        const response = await postServiceList({
          locale,
          city_name: cityName || undefined,
          include_packages: true,
          include_faqs: true,
          include_cities: true,
        });

        const item = response?.items?.[0] || null;
        if (!isActive) return;
        setServiceItem(item);
        setStatus(item ? 'ready' : 'empty');
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(error?.message || t('status.error'));
        setStatus('error');
      }
    };

    fetchService();

    return () => {
      isActive = false;
    };
  }, [cityName, locale]);

  const selectedCity =
    serviceItem?.selected_city || serviceItem?.cities?.[0] || null;
  const availabilityStatus = selectedCity?.availability_status || 'unknown';
  const badgeLabel = t(`service.availability.${availabilityStatus}`);
  const priceRange = serviceItem?.price_range;
  const priceCurrency = priceRange?.currency_code || t('service.priceCurrency');
  const priceAmount = formatPriceRange(priceRange, t('service.priceFallback'));
  const serviceDescription =
    serviceItem?.long_description ||
    serviceItem?.short_description ||
    t('serviceDescription.fallbackBody');
  const resolvedCityName =
    selectedCity?.name || cityName || t('service.cityFallback');

  const statusContent =
    status === 'loading' ? (
      <div className="service-detail-page__status">
        <Heading level={3} size="sm">
          {t('status.loading')}
        </Heading>
        <Text size="sm">{t('status.loadingHint')}</Text>
      </div>
    ) : null;

  const errorContent =
    status === 'error' ? (
      <div className="service-detail-page__status">
        <Heading level={3} size="sm">
          {t('status.error')}
        </Heading>
        <Text size="sm">{errorMessage}</Text>
      </div>
    ) : null;

  const emptyContent =
    status === 'empty' ? (
      <div className="service-detail-page__status">
        <Heading level={3} size="sm">
          {t('status.empty')}
        </Heading>
        <Text size="sm">{t('status.emptyHint')}</Text>
      </div>
    ) : null;

  return (
    <PrimaryLayout>
      <div className="service-detail-page">
        {statusContent}
        {errorContent}
        {emptyContent}

        {status === 'ready' ? (
          <>
            <ServiceHeader
              title={serviceItem?.name || t('service.title')}
              subtitle={serviceItem?.short_description || t('service.subtitle')}
              badgeLabel={badgeLabel}
              cityLabel={t('service.cityLabel')}
              cityName={resolvedCityName}
              priceLabel={t('service.priceLabel')}
              priceCurrency={priceCurrency}
              priceAmount={priceAmount}
              pricePeriod={t('service.pricePeriod')}
            />

            <NoticePeriodBanner
              title={t('notice.title')}
              description={t('notice.description')}
              periodLabel={t('notice.periodLabel')}
              periodValue={t('notice.periodValue')}
              note={t('notice.note')}
              actionLabel={t('notice.actionLabel')}
              actionTo="/auth"
            />

            <ServiceDescription
              title={t('serviceDescription.title')}
              subtitle={t('serviceDescription.subtitle')}
              description={serviceDescription}
              requirementsTitle={t('serviceDescription.requirementsTitle')}
              requirements={[
                t('serviceDescription.requirements.items.kit'),
                t('serviceDescription.requirements.items.packaging'),
                t('serviceDescription.requirements.items.locations'),
                t('serviceDescription.requirements.items.schedule'),
              ]}
              durationLabel={t('serviceDescription.durationLabel')}
              durationValue={t('serviceDescription.durationValue')}
              durationNote={t('serviceDescription.durationNote')}
            />

            <BookingCTA
              title={t('booking.title')}
              subtitle={t('booking.subtitle')}
              priceLabel={t('booking.priceLabel')}
              priceCurrency={priceCurrency}
              priceAmount={priceAmount}
              pricePeriod={t('booking.pricePeriod')}
              actionLabel={t('booking.actionLabel')}
              actionTo="/auth"
            />
          </>
        ) : null}
      </div>
    </PrimaryLayout>
  );
}
