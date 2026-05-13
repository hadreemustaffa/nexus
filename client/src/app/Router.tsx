import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { paths } from '../config/paths';
import {
  default as AppRoot,
  ErrorBoundary as AppRootErrorBoundary,
} from './routes/app/Root';

const router = createBrowserRouter([
  {
    path: paths.app.root.path,
    element: <AppRoot />,
    ErrorBoundary: AppRootErrorBoundary,
    children: [],
  },
  {
    path: '*',
    lazy: () =>
      import('./routes/NotFound').then((module) => ({
        Component: module.default,
      })),
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
