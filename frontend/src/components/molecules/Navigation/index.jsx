import NavigationItem from '@/components/molecules/NavigationItem/index.jsx';
import './navigation.scss';

const links = [
  { to: '/', label: 'Home' },
  { to: '/demo', label: 'Demo' },
  { to: '/test', label: 'Playground' },
];

export default function Navigation() {
  return (
    <nav className="site-nav" aria-label="Primary">
      <ul className="site-nav__list">
        {links.map((link) => (
          <NavigationItem key={link.to} to={link.to} label={link.label} end={link.to === '/'} />
        ))}
      </ul>
    </nav>
  );
}
