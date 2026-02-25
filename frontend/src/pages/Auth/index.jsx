import { useState } from 'react';
import PrimaryLayout from '@/layouts/Primary/index.jsx';
import { createTranslator } from '@/translations/index.js';
import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import Button from '@/components/atoms/Button/index.jsx';
import EmailInput from '@/components/atoms/EmailInput/index.jsx';
import OtpInput from '@/components/atoms/OtpInput/index.jsx';
import en from './translations/en.json';
import './page.scss';

export default function AuthPage() {
  const { t } = createTranslator({ en });
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // UI-only for now; connect to auth endpoint when available.
    console.info('[auth]', { email, otp });
  };

  return (
    <PrimaryLayout>
      <div className="auth-page">
        <header className="auth-page__header">
          <Heading level={1}>{t('title')}</Heading>
          <Text size="lg">{t('subtitle')}</Text>
        </header>

        <form className="auth-page__card" onSubmit={handleSubmit}>
          <EmailInput
            label={t('emailLabel')}
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <OtpInput
            label={t('otpLabel')}
            description={t('otpHint')}
            value={otp}
            onChange={setOtp}
            length={6}
            disabled={!email}
          />

          <div className="auth-page__actions">
            <Button type="submit" disabled={!email}>
              {t('submit')}
            </Button>
          </div>
        </form>
      </div>
    </PrimaryLayout>
  );
}

