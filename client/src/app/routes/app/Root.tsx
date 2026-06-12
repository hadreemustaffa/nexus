import { Outlet, useLocation, useMatch } from 'react-router';

import { paths } from '../../../config/paths';
import { ERRORS } from '../../../shared';
import AppLayout from '../../../shared/ui/layouts/AppLayout';
import NotesLayout from '../../../shared/ui/layouts/NotesLayout';
import Loader from '../../../shared/ui/loader/Loader';
import styles from './Root.module.css';

export const AppRootErrorBoundary = () => {
  return <div className={styles.error}>{ERRORS.API.SERVER_ERROR}</div>;
};

export const AppRootLoader = () => {
  return (
    <div className={styles.loading}>
      <Loader />
    </div>
  );
};

const AppRoot = () => {
  const { pathname } = useLocation();
  const isNotesRoutes = useMatch(`${paths.app.notes.getHref()}/*`);

  const isRootOrNotes = pathname === '/' || isNotesRoutes;

  return <AppLayout>{isRootOrNotes ? <NotesLayout /> : <Outlet />}</AppLayout>;
};

export default AppRoot;
