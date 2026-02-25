import { useState } from 'react';
import PrimaryLayout from '@/layouts/Primary/index.jsx';
import CitySelector from '@/components/organisms/CitySelector/index.jsx';
import TextInput from '@/components/atoms/TextInput/index.jsx';
import EmailInput from '@/components/atoms/EmailInput/index.jsx';
import Textarea from '@/components/atoms/Textarea/index.jsx';
import CheckboxField from '@/components/atoms/CheckboxField/index.jsx';
import SelectInput from '@/components/atoms/SelectInput/index.jsx';
import DateInput from '@/components/atoms/DateInput/index.jsx';
import OtpInput from '@/components/atoms/OtpInput/index.jsx';
import { createTranslator } from '@/translations/index.js';
import en from './translations/en.json';
import './page.scss';

const componentCards = [
  {
    heading: 'Header',
    copy: 'Branding, logo, and navigation that sits above every page.',
  },
  {
    heading: 'Footer',
    copy: 'Mirror the navigation with an optional brand notice and legal links.',
  },
  {
    heading: 'Navigation',
    copy: 'A horizontal link bar that highlights the current route.',
  },
  {
    heading: 'City selector',
    copy: 'A simple controls rack for the markets we support.',
  },
];

export default function TestPage() {
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [role, setRole] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [otp, setOtp] = useState('');
  const { t } = createTranslator({ en });

  const emailError = email && !email.includes('@') ? t('emailError') : '';
  const otpError = otp && otp.length < 6 ? t('otpError') : '';

  return (
    <PrimaryLayout>
      <div className="test-page">
        <section className="test-page__hero">
          <p className="test-page__eyebrow">{t('eyebrow')}</p>
          <h1 className="test-page__title">{t('title')}</h1>
          <p className="test-page__description">{t('description')}</p>
        </section>

        <section className="test-page__panel">
          <div className="test-page__panel-heading">
            <h2>{t('componentListTitle')}</h2>
            <p className="test-page__panel-subtitle">{t('componentListDescription')}</p>
          </div>
          <ul className="test-page__component-list">
            {componentCards.map((card) => (
              <li key={card.heading} className="test-page__component-card">
                <p className="test-page__component-heading">{card.heading}</p>
                <p className="test-page__component-copy">{card.copy}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="test-page__panel">
          <div className="test-page__selector-header">
            <h3>City selector</h3>
            <p className="test-page__selector-note">{t('selectorNote')}</p>
          </div>
          <CitySelector selectedCity={selectedCity} onSelect={setSelectedCity} />
          <p className="test-page__selector-status">
            {selectedCity
              ? `Live preview is focused on ${selectedCity}.`
              : 'Pick a city to activate the selector.'}
          </p>
        </section>

        <section className="test-page__panel">
          <div className="test-page__panel-heading">
            <h2>{t('formAtomsTitle')}</h2>
            <p className="test-page__panel-subtitle">{t('formAtomsDescription')}</p>
          </div>

          <div className="test-page__form-grid">
            <TextInput
              label={t('nameLabel')}
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              description={t('nameHint')}
            />

            <EmailInput
              label={t('emailLabel')}
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              description={t('emailHint')}
              error={emailError}
            />

            <SelectInput
              label={t('roleLabel')}
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder={t('rolePlaceholder')}
              options={[
                { value: 'buyer', label: t('roleBuyer') },
                { value: 'seller', label: t('roleSeller') },
                { value: 'partner', label: t('rolePartner') },
              ]}
            />

            <DateInput
              label={t('dateLabel')}
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
              description={t('dateHint')}
            />

            <OtpInput
              label={t('otpLabel')}
              description={t('otpHint')}
              value={otp}
              onChange={setOtp}
              error={otpError}
              length={6}
            />

            <Textarea
              label={t('messageLabel')}
              placeholder={t('messagePlaceholder')}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              description={t('messageHint')}
              rows={5}
            />

            <CheckboxField
              label={t('termsLabel')}
              checked={acceptTerms}
              onChange={(event) => setAcceptTerms(event.target.checked)}
              description={t('termsHint')}
            />
          </div>

          <div className="test-page__form-debug">
            <p className="test-page__form-debug-title">{t('formDebugTitle')}</p>
            <pre className="test-page__form-debug-code">
              {JSON.stringify(
                {
                  name,
                  email,
                  role,
                  deliveryDate,
                  otp,
                  message,
                  acceptTerms,
                },
                null,
                2
              )}
            </pre>
          </div>
        </section>
      </div>
    </PrimaryLayout>
  );
}
