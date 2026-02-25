import { createTranslator } from '@/translations/index.js';
import { Link } from 'react-router-dom';
import logo from '@/assets/images/logo.png';
import en from './translations/en.json';
import './footer.scss';

export default function Footer() {
  const { t } = createTranslator({ en });
  const year = new Date().getFullYear();

  const exploreLinks = [
    { to: '/', label: t('links.home') },
    { to: '/demo', label: t('links.demo') },
    { to: '/test', label: t('links.playground') },
  ];

  const legalLinks = [
    { to: '/terms', label: t('links.terms') },
    { to: '/privacy', label: t('links.privacy') },
  ];

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo-link" aria-label={t('brand')}>
            <img className="site-footer__logo" src={logo} alt={t('brand')} />
            <span className="site-footer__brand-text">
              <span className="site-footer__brand-name">{t('brand')}</span>
              <span className="site-footer__tagline">{t('tagline')}</span>
            </span>
          </Link>
          <p className="site-footer__description">{t('description')}</p>
        </div>

        <nav className="site-footer__section" aria-label={t('exploreTitle')}>
          <p className="site-footer__section-title">{t('exploreTitle')}</p>
          <ul className="site-footer__link-list">
            {exploreLinks.map((link) => (
              <li key={link.to}>
                <Link className="site-footer__link" to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="site-footer__section" aria-label={t('legalTitle')}>
          <p className="site-footer__section-title">{t('legalTitle')}</p>
          <ul className="site-footer__link-list">
            {legalLinks.map((link) => (
              <li key={link.to}>
                <Link className="site-footer__link" to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="site-footer__section site-footer__contact" aria-label={t('contactTitle')}>
          <p className="site-footer__section-title">{t('contactTitle')}</p>
          <ul className="site-footer__contact-list">
            <li>
              <a className="site-footer__link" href={`mailto:${t('contact.email')}`}>
                {t('contact.email')}
              </a>
            </li>
            <li>
              <a className="site-footer__link" href={`tel:${t('contact.phoneRaw')}`}>
                {t('contact.phone')}
              </a>
            </li>
            <li className="site-footer__contact-location">{t('contact.location')}</li>
          </ul>
        </address>
      </div>

      <div className="site-footer__bottom">
        <p className="site-footer__bottom-copy">{t('copyright', { year })}</p>
        <p className="site-footer__bottom-copy site-footer__disclaimer">{t('disclaimer')}</p>
      </div>
    </footer>
  );
}
