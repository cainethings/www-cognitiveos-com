import { useNavigate } from 'react-router-dom';
import { createTranslator } from '@/translations/index.js';
import Navigation from '@/components/molecules/Navigation/index.jsx';
import LogoBlock from '@/components/molecules/LogoBlock/index.jsx';
import CitySelectorMenu from '@/components/molecules/CitySelectorMenu/index.jsx';
import AccountTrigger from '@/components/molecules/AccountTrigger/index.jsx';
import Button from '@/components/atoms/Button/index.jsx';
import logo from '@/assets/images/logo.png';
import en from './translations/en.json';
import './header.scss';

export default function Header() {
  const { t } = createTranslator({ en });
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <LogoBlock
          className="site-header__brand"
          src={logo}
          alt={t('brand')}
          ariaLabel={t('brand')}
        />

        <div className="site-header__nav">
          <Navigation />
        </div>

        <div className="site-header__actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/service-detail')}
          >
            {t('serviceCta')}
          </Button>
          <CitySelectorMenu label={t('cityLabel')} dialogLabel={t('cityDialogLabel')} />
          <AccountTrigger signInLabel={t('authTrigger')} accountLabel={t('accountTrigger')} />
        </div>
      </div>
    </header>
  );
}
