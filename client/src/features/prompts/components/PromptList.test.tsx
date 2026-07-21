import { type ApiResponse, PROMPT_CHARS_MIN } from '@nexus/shared';
import { render, screen } from '@testing-library/react';
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useLoaderData,
} from 'react-router';

import { paths } from '../../../config/paths';
import type { Prompt } from '../types';
import PromptList from './PromptList';

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');

  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

vi.mock('./Prompt', () => ({
  default: ({ prompt }: { prompt: Prompt }) => (
    <div data-testid='prompt'>
      {prompt.key} v{prompt.version}
    </div>
  ),
}));

describe('PromptList', () => {
  const mockedUseLoaderData = vi.mocked(useLoaderData);

  const createPrompt = (overrides: Partial<Prompt> = {}): Prompt => ({
    id: crypto.randomUUID(),
    key: 'tagging',
    content: 'W'.repeat(PROMPT_CHARS_MIN),
    version: 1,
    isDefault: false,
    isActive: false,
    created_at: '2026-01-01T12:00:00Z',
    ...overrides,
  });

  const renderPromptList = (prompts: Prompt[]) => {
    const loaderData: ApiResponse<{ prompts: Prompt[] }> = {
      data: { prompts },
      message: 'Success',
    };

    mockedUseLoaderData.mockReturnValue(loaderData);

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <Outlet />,
          children: [
            {
              path: 'settings',
              element: <Outlet />,
              children: [
                {
                  path: 'prompts',
                  element: <PromptList />,
                },
              ],
            },
          ],
        },
      ],
      {
        initialEntries: ['/settings/prompts'],
      }
    );

    return render(<RouterProvider router={router} />);
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Create link', () => {
    renderPromptList([]);

    expect(screen.getByRole('link', { name: /create/i })).toHaveAttribute(
      'href',
      paths.app.settings.prompts.create.getHref()
    );
  });

  it('renders "No prompts found." when there are no prompts', () => {
    renderPromptList([]);

    expect(screen.getByText('No prompts found.')).toBeInTheDocument();
  });

  it('groups prompts by key', () => {
    renderPromptList([
      createPrompt({
        id: '1',
        key: 'tagging',
      }),
      createPrompt({
        id: '2',
        key: 'recommendation',
      }),
    ]);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'tagging',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'recommendation',
      })
    ).toBeInTheDocument();
  });

  it('renders multiple prompts with the same key in a single group', () => {
    renderPromptList([
      createPrompt({
        id: '1',
        key: 'tagging',
        version: 1,
      }),
      createPrompt({
        id: '2',
        key: 'tagging',
        version: 2,
      }),
      createPrompt({
        id: '3',
        key: 'recommendation',
        version: 1,
      }),
    ]);

    expect(
      screen.getAllByRole('heading', {
        level: 3,
        name: 'tagging',
      })
    ).toHaveLength(1);

    expect(screen.getAllByTestId('prompt')).toHaveLength(3);

    expect(screen.getByText('tagging v1')).toBeInTheDocument();
    expect(screen.getByText('tagging v2')).toBeInTheDocument();
    expect(screen.getByText('recommendation v1')).toBeInTheDocument();
  });
});
