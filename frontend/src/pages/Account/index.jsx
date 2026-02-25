import PrimaryLayout from '@/layouts/Primary/index.jsx';
import { createTranslator } from '@/translations/index.js';
import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import en from './translations/en.json';
import './page.scss';

export default function AccountPage() {
  const { t } = createTranslator({ en });

  return (
    <PrimaryLayout>
      <div className="account-page">
        <header className="account-page__header">
          <Heading level={1}>{t('title')}</Heading>
          <Text size="lg">{t('subtitle')}</Text>
        </header>
      </div>
    </PrimaryLayout>
  );
}

