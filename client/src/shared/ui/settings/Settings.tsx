import { NavLink, Outlet } from 'react-router';

import { paths } from '../../../config/paths';
import SettingsLayout from '../layouts/SettingsLayout';
import styles from './Settings.module.css';

export default function Settings() {
  return (
    <SettingsLayout>
      <div className={styles.settings}>
        <div className={styles.list}>
          <NavLink to={paths.app.settings.prompts.getHref()} className={`btn`}>
            Prompts
          </NavLink>
        </div>

        <div>
          <NavLink to={paths.app.root.getHref()} className={`btn`}>
            Home
          </NavLink>
        </div>
      </div>

      <Outlet />
    </SettingsLayout>
  );
}
