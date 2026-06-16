import {
  isRouteErrorResponse,
  Outlet,
  useLocation,
  useMatch,
  useNavigate,
  useRouteError,
} from 'react-router';

import { paths } from '../../../config/paths';
import { ERRORS } from '../../../shared';
import Button from '../../../shared/ui/button/Button';
import AppLayout from '../../../shared/ui/layouts/AppLayout';
import NotesLayout from '../../../shared/ui/layouts/NotesLayout';
import Loader from '../../../shared/ui/loader/Loader';
import styles from './Root.module.css';

function ErrorElement({ message }: { message: string }) {
  const navigate = useNavigate();

  return (
    <div className={styles.error_container}>
      <div className={styles.error}>
        <div>{message}</div>
        <Button onClick={() => void navigate(-1)}>Go back</Button>
      </div>
    </div>
  );
}

export const AppRootErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <ErrorElement message={ERRORS.API.NOT_FOUND} />;
    }

    if (error.status === 500) {
      return <ErrorElement message={ERRORS.SERVER_ERROR} />;
    }
  }

  return <ErrorElement message={ERRORS.NETWORK_ERROR} />;
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
