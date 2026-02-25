import PrimaryLayout from '@/layouts/Primary/index.jsx';
import { createTranslator } from '@/translations/index.js';
import HeroCarousel from '@/components/organisms/HeroCarousel/index.jsx';
import Heading from '@/components/atoms/Heading/index.jsx';
import Text from '@/components/atoms/Text/index.jsx';
import CategorySection from '@/components/organisms/CategorySection/index.jsx';
import ImageGallery from '@/components/organisms/ImageGallery/index.jsx';
import TrustSection from '@/components/organisms/TrustSection/index.jsx';
import en from './translations/en.json';
import './page.scss';

export default function HomePage() {
  const { t } = createTranslator({ en });

  const slides = [
    {
      id: 'discover',
      accent: '#f59e0b',
      eyebrow: t('hero.slides.discover.eyebrow'),
      title: t('hero.slides.discover.title'),
      subtitle: t('hero.slides.discover.subtitle'),
      bullets: [
        t('hero.slides.discover.bullets.city'),
        t('hero.slides.discover.bullets.components'),
        t('hero.slides.discover.bullets.responsive'),
      ],
      primaryAction: { label: t('hero.slides.discover.primaryCta'), to: '/demo' },
      secondaryAction: { label: t('hero.slides.discover.secondaryCta'), to: '/test' },
      mediaLabel: t('hero.slides.discover.mediaLabel'),
    },
    {
      id: 'build',
      accent: '#10b981',
      eyebrow: t('hero.slides.build.eyebrow'),
      title: t('hero.slides.build.title'),
      subtitle: t('hero.slides.build.subtitle'),
      bullets: [
        t('hero.slides.build.bullets.atoms'),
        t('hero.slides.build.bullets.accessible'),
        t('hero.slides.build.bullets.fast'),
      ],
      primaryAction: { label: t('hero.slides.build.primaryCta'), to: '/test' },
      secondaryAction: { label: t('hero.slides.build.secondaryCta'), to: '/auth' },
      mediaLabel: t('hero.slides.build.mediaLabel'),
    },
    {
      id: 'launch',
      accent: '#6366f1',
      eyebrow: t('hero.slides.launch.eyebrow'),
      title: t('hero.slides.launch.title'),
      subtitle: t('hero.slides.launch.subtitle'),
      bullets: [
        t('hero.slides.launch.bullets.layout'),
        t('hero.slides.launch.bullets.policies'),
        t('hero.slides.launch.bullets.routes'),
      ],
      primaryAction: { label: t('hero.slides.launch.primaryCta'), to: '/terms' },
      secondaryAction: { label: t('hero.slides.launch.secondaryCta'), to: '/privacy' },
      mediaLabel: t('hero.slides.launch.mediaLabel'),
    },
  ];

  const categories = [
    { id: 'grocery', title: t('categories.items.grocery.title'), description: t('categories.items.grocery.description'), ctaLabel: t('categories.items.grocery.cta'), to: '/demo', accent: '#f59e0b' },
    { id: 'handmade', title: t('categories.items.handmade.title'), description: t('categories.items.handmade.description'), ctaLabel: t('categories.items.handmade.cta'), to: '/demo', accent: '#6366f1' },
    { id: 'wellness', title: t('categories.items.wellness.title'), description: t('categories.items.wellness.description'), ctaLabel: t('categories.items.wellness.cta'), to: '/demo', accent: '#10b981' },
    { id: 'fashion', title: t('categories.items.fashion.title'), description: t('categories.items.fashion.description'), ctaLabel: t('categories.items.fashion.cta'), to: '/demo', accent: '#ef4444' },
    { id: 'home', title: t('categories.items.home.title'), description: t('categories.items.home.description'), ctaLabel: t('categories.items.home.cta'), to: '/demo', accent: '#0ea5e9' },
    { id: 'gifting', title: t('categories.items.gifting.title'), description: t('categories.items.gifting.description'), ctaLabel: t('categories.items.gifting.cta'), to: '/demo', accent: '#a855f7' },
  ];

  const galleryItems = [
    { id: 'spices', title: t('gallery.items.spices.title'), description: t('gallery.items.spices.description'), tag: t('gallery.items.spices.tag'), accent: '#f97316', size: 'feature' },
    { id: 'textiles', title: t('gallery.items.textiles.title'), description: t('gallery.items.textiles.description'), tag: t('gallery.items.textiles.tag'), accent: '#0ea5e9', size: 'tall' },
    { id: 'snacks', title: t('gallery.items.snacks.title'), description: t('gallery.items.snacks.description'), tag: t('gallery.items.snacks.tag'), accent: '#22c55e', size: 'wide' },
    { id: 'wellness', title: t('gallery.items.wellness.title'), description: t('gallery.items.wellness.description'), tag: t('gallery.items.wellness.tag'), accent: '#6366f1' },
    { id: 'homeware', title: t('gallery.items.homeware.title'), description: t('gallery.items.homeware.description'), tag: t('gallery.items.homeware.tag'), accent: '#f59e0b' },
    { id: 'gifting', title: t('gallery.items.gifting.title'), description: t('gallery.items.gifting.description'), tag: t('gallery.items.gifting.tag'), accent: '#ec4899' },
  ];

  const trustIndicators = [
    { id: 'sourcing', value: t('trust.items.sourcing.value'), label: t('trust.items.sourcing.label'), description: t('trust.items.sourcing.description'), tag: t('trust.items.sourcing.tag'), icon: 'check', accent: '#10b981' },
    { id: 'delivery', value: t('trust.items.delivery.value'), label: t('trust.items.delivery.label'), description: t('trust.items.delivery.description'), tag: t('trust.items.delivery.tag'), icon: 'star', accent: '#f59e0b' },
    { id: 'support', value: t('trust.items.support.value'), label: t('trust.items.support.label'), description: t('trust.items.support.description'), tag: t('trust.items.support.tag'), icon: 'dots', accent: '#6366f1' },
    { id: 'secure', value: t('trust.items.secure.value'), label: t('trust.items.secure.label'), description: t('trust.items.secure.description'), tag: t('trust.items.secure.tag'), icon: 'check', accent: '#0ea5e9' },
  ];

  return (
    <PrimaryLayout>
      <div className="home-page">
        <HeroCarousel
          slides={slides}
          ariaLabel={t('hero.ariaLabel')}
          previousLabel={t('hero.controls.previous')}
          nextLabel={t('hero.controls.next')}
          getDotLabel={(index) => t('hero.controls.goTo', { number: index + 1 })}
        />

        <header className="home-page__intro">
          <Heading level={1}>{t('hello')}</Heading>
          <Text size="lg">{t('intro.subtitle')}</Text>
        </header>

        <CategorySection
          title={t('categories.title')}
          subtitle={t('categories.subtitle')}
          categories={categories}
        />

        <ImageGallery
          title={t('gallery.title')}
          subtitle={t('gallery.subtitle')}
          items={galleryItems}
        />

        <TrustSection
          title={t('trust.title')}
          subtitle={t('trust.subtitle')}
          indicators={trustIndicators}
        />
      </div>
    </PrimaryLayout>
  );
}
