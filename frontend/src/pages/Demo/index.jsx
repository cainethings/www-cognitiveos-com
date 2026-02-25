import PrimaryLayout from '@/layouts/Primary/index.jsx';
import { createTranslator } from '@/translations/index.js';
import Button from '@/components/atoms/Button/index.jsx';
import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import Icon from '@/components/atoms/Icon/index.jsx';
import Badge from '@/components/atoms/Badge/index.jsx';
import Loader from '@/components/atoms/Loader/index.jsx';
import en from './translations/en.json';
import './page.scss';

export default function DemoPage() {
  const { t } = createTranslator({ en });

  return (
    <PrimaryLayout>
      <div className="demo-page">
        <header className="demo-page__header">
          <Heading level={1}>{t('title')}</Heading>
          <Text size="lg">{t('subtitle')}</Text>
        </header>

        <div className="demo-page__grid">
          <section className="demo-card">
            <Heading level={2} size="sm">
              {t('sections.buttons')}
            </Heading>
            <div className="demo-row">
              <Button>{t('buttons.primary')}</Button>
              <Button variant="secondary">{t('buttons.secondary')}</Button>
              <Button variant="ghost">{t('buttons.ghost')}</Button>
              <Button disabled>{t('buttons.disabled')}</Button>
            </div>
          </section>

          <section className="demo-card">
            <Heading level={2} size="sm">
              {t('sections.text')}
            </Heading>
            <Text>{t('text.body')}</Text>
            <Text size="sm" weight="medium">
              {t('text.small')}
            </Text>
          </section>

          <section className="demo-card">
            <Heading level={2} size="sm">
              {t('sections.icons')}
            </Heading>
            <div className="demo-row">
              <Icon name="plus" size={24} />
              <Icon name="dots" size={24} />
              <Icon name="check" size={24} />
              <Icon name="star" size={24} />
            </div>
          </section>

          <section className="demo-card">
            <Heading level={2} size="sm">
              {t('sections.badges')}
            </Heading>
            <div className="demo-row">
              <Badge label={t('badges.simple')} />
              <Badge label={t('badges.status')} tone="success" icon="check" />
              <Badge
                label={t('badges.complex')}
                subLabel={t('badges.note')}
                variant="complex"
                icon="star"
              />
            </div>
          </section>

          <section className="demo-card">
            <Heading level={2} size="sm">
              {t('sections.loader')}
            </Heading>
            <Loader label={t('loader.label')} />
          </section>
        </div>
      </div>
    </PrimaryLayout>
  );
}
