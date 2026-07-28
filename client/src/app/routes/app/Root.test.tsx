import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { paths } from '../../../config/paths';
import { ERRORS } from '../../../shared';
import AppRoot, { AppRootErrorBoundary, AppRootLoader } from './Root';

vi.mock('../../../shared/ui/layouts/AppLayout', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid='app-layout'>{children}</div>
  ),
}));

vi.mock('../../../shared/ui/layouts/NotesLayout', () => ({
  default: () => <div data-testid='notes-layout' />,
}));

vi.mock('../../../shared/ui/loader/Loader', () => ({
  default: () => <div data-testid='loader' />,
}));

function renderWithErrorRoute(loader: () => never) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        loader,
        element: <div>should not render</div>,
        errorElement: <AppRootErrorBoundary />,
      },
    ],
    { initialEntries: ['/'] }
  );

  return render(<RouterProvider router={router} />);
}

function renderAppRootAt(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppRoot />,
        children: [{ path: '*', element: <div data-testid='outlet-child' /> }],
      },
    ],
    { initialEntries: [initialPath] }
  );

  return render(<RouterProvider router={router} />);
}

describe('AppRootErrorBoundary', () => {
  it('shows the not-found message for a 404 route error', async () => {
    renderWithErrorRoute(() => {
      throw new Response(null, { status: 404, statusText: 'Not Found' });
    });

    expect(await screen.findByText(ERRORS.API.NOT_FOUND)).toBeInTheDocument();
  });

  it('shows the server-error message for a 500 route error', async () => {
    renderWithErrorRoute(() => {
      throw new Response(null, {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });

    expect(await screen.findByText(ERRORS.SERVER_ERROR)).toBeInTheDocument();
  });

  it.each([401, 403, 418, 502, 503])(
    'falls back to the network-error message for a %i route error response',
    async (status) => {
      renderWithErrorRoute(() => {
        throw new Response(null, { status });
      });

      expect(await screen.findByText(ERRORS.NETWORK_ERROR)).toBeInTheDocument();
    }
  );

  it('falls back to the network-error message for a plain (non-route) Error', async () => {
    renderWithErrorRoute(() => {
      throw new Error('boom');
    });

    expect(await screen.findByText(ERRORS.NETWORK_ERROR)).toBeInTheDocument();
  });

  it('falls back to the network-error message when a non-Error value is thrown', async () => {
    renderWithErrorRoute(() => {
      // eslint-disable-next-line -- intentionally throwing a non-Error value to exercise the fallback branch
      throw 'a random string was thrown';
    });

    expect(await screen.findByText(ERRORS.NETWORK_ERROR)).toBeInTheDocument();
  });

  it('renders a "Go back" button that does not crash on click', async () => {
    renderWithErrorRoute(() => {
      throw new Response(null, { status: 404 });
    });

    const goBackButton = await screen.findByRole('button', {
      name: /go back/i,
    });

    expect(() => fireEvent.click(goBackButton)).not.toThrow();
  });
});

describe('AppRoot', () => {
  const notesHref = paths.app.notes.getHref();

  it('renders NotesLayout at /', async () => {
    renderAppRootAt('/');

    expect(await screen.findByTestId('notes-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('outlet-child')).not.toBeInTheDocument();
  });

  it('renders NotesLayout at / even with a query string', async () => {
    renderAppRootAt('/?ref=email');

    expect(await screen.findByTestId('notes-layout')).toBeInTheDocument();
  });

  it('renders NotesLayout for the notes route', async () => {
    renderAppRootAt(notesHref);

    expect(await screen.findByTestId('notes-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('outlet-child')).not.toBeInTheDocument();
  });

  it('renders NotesLayout for nested notes routes', async () => {
    renderAppRootAt(`${notesHref}/123/edit`);

    expect(await screen.findByTestId('notes-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('outlet-child')).not.toBeInTheDocument();
  });

  it('renders NotesLayout for the notes route with a trailing slash', async () => {
    renderAppRootAt(`${notesHref}/`);

    expect(await screen.findByTestId('notes-layout')).toBeInTheDocument();
  });

  it('renders a plain Outlet for unrelated routes', async () => {
    renderAppRootAt('/settings');

    expect(await screen.findByTestId('outlet-child')).toBeInTheDocument();
    expect(screen.queryByTestId('notes-layout')).not.toBeInTheDocument();
  });

  it('does not treat a route that merely starts with the notes segment as a notes route', async () => {
    // e.g. "/notes-archive" must not match the "/notes/*" pattern
    renderAppRootAt(`${notesHref}-archive`);

    expect(await screen.findByTestId('outlet-child')).toBeInTheDocument();
    expect(screen.queryByTestId('notes-layout')).not.toBeInTheDocument();
  });

  it('wraps the NotesLayout branch in AppLayout', async () => {
    renderAppRootAt('/');

    expect(await screen.findByTestId('app-layout')).toBeInTheDocument();
  });

  it('wraps the Outlet branch in AppLayout', async () => {
    renderAppRootAt('/settings');

    expect(await screen.findByTestId('app-layout')).toBeInTheDocument();
  });
});

describe('AppRootLoader', () => {
  it('renders the Loader inside a loading container', () => {
    render(<AppRootLoader />);

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});
