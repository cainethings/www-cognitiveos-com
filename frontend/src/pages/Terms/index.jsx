import PrimaryLayout from '@/layouts/Primary/index.jsx';
import { createTranslator } from '@/translations/index.js';
import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import en from './translations/en.json';
import './page.scss';

export default function TermsPage() {
  const { t } = createTranslator({ en });

  return (
    <PrimaryLayout>
      <div className="policy-page">
        <header className="policy-page__header">
          <Heading level={1}>{t('title')}</Heading>
          <Text size="lg">{t('subtitle')}</Text>
        </header>

        <section className="policy-page__content">
          <Text>{t('body')}</Text>
        </section>
      </div>
    </PrimaryLayout>
  );
}

