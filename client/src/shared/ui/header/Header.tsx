import { SettingsIcon } from 'lucide-react';
import { NavLink } from 'react-router';

import { paths } from '../../../config/paths';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <NavLink
        to={paths.app.settings.getHref()}
        className={`btn ${styles.btn_settings} `}
      >
        <SettingsIcon size={16} /> Settings
      </NavLink>
    </header>
  );
}
