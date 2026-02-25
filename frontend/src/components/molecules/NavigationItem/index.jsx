import { NavLink } from 'react-router-dom';

export default function NavigationItem({ to, label, end = false }) {
  return (
    <li className="site-nav__item">
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          ['site-nav__link', isActive ? 'active' : ''].filter(Boolean).join(' ')
        }
      >
        {label}
      </NavLink>
    </li>
  );
}
