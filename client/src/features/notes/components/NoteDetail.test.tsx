import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { useFetcher, useLoaderData } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import NoteDetail from './NoteDetail';

interface TagFixture {
  id: string;
  name: string;
}
interface NoteFixture {
  id: string;
  title: string;
  content: string;
}
interface NoteWithTagsFixture {
  note: NoteFixture;
  tags: TagFixture[];
}

vi.mock('./NoteDetail.module.css', () => ({
  default: new Proxy({}, { get: (_target, prop) => String(prop) }),
}));

vi.mock('@nexus/shared', () => ({
  api: {
    notes: {
      events: {
        getRoute: (id: string) => `/notes/${id}/events`,
      },
    },
  },
}));

vi.mock('../../../config/paths', () => ({
  paths: {
    app: {
      notes: {
        note: { getHref: (id: string) => `/notes/${id}` },
        edit: { getHref: (id: string) => `/notes/${id}/edit` },
        regenerateNoteTags: {
          getHref: (id: string) => `/notes/${id}/regenerate-tags`,
        },
      },
    },
  },
}));

vi.mock('../../../shared/ui/button/Button', () => ({
  default: ({
    children,
    ...rest
  }: { children: ReactNode } & Record<string, unknown>) => (
    <button {...rest}>{children}</button>
  ),
}));

vi.mock('../../tags/Tag', () => ({
  default: ({ label }: { label: string }) => <span>{label}</span>,
}));

// react-router: mock only what NoteDetail actually uses. `Form` (used for
// the plain Delete form) is rendered as a real <form> with preventDefault
// so jsdom doesn't attempt a real navigation.
vi.mock('react-router', () => ({
  useLoaderData: vi.fn(),
  useFetcher: vi.fn(),
  useNavigate: () => vi.fn(),
  NavLink: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
  Form: ({
    children,
    onSubmit,
    ...rest
  }: {
    children: ReactNode;
    onSubmit?: (e: React.FormEvent) => void;
  } & Record<string, unknown>) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      {...rest}
    >
      {children}
    </form>
  ),
}));

// `useFetcher()` returns its own `Form` component distinct from the
// top-level `Form` export — mocked the same way (render + preventDefault +
// forward onSubmit) so the Regenerate Tags submit behaves like the real one.
function FetcherFormMock({
  children,
  onSubmit,
  ...rest
}: { children: ReactNode; onSubmit?: (e: React.FormEvent) => void } & Record<
  string,
  unknown
>) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      {...rest}
    >
      {children}
    </form>
  );
}

class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  closed = false;
  private listeners: Record<string, Array<(event: { data: string }) => void>> =
    {};

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: { data: string }) => void) {
    this.listeners[type] = this.listeners[type] ?? [];
    this.listeners[type].push(listener);
  }

  removeEventListener(
    type: string,
    listener: (event: { data: string }) => void
  ) {
    this.listeners[type] = (this.listeners[type] ?? []).filter(
      (fn) => fn !== listener
    );
  }

  close() {
    this.closed = true;
  }

  emit(type: string, data: unknown) {
    for (const listener of this.listeners[type] ?? []) {
      listener({ data: JSON.stringify(data) });
    }
  }
}

const defaultTags: TagFixture[] = [{ id: 'tag-1', name: 'Existing Tag' }];

const defaultNote: NoteWithTagsFixture = {
  note: { id: 'note-1', title: 'Test Note', content: 'Note content body' },
  tags: defaultTags,
};

function renderNoteDetail({
  note = defaultNote,
  related = [] as NoteFixture[],
}: {
  note?: NoteWithTagsFixture;
  related?: NoteFixture[];
} = {}) {
  vi.mocked(useLoaderData).mockReturnValue({
    note: { data: note },
    related: { data: related },
  });

  return render(<NoteDetail />);
}

beforeEach(() => {
  MockEventSource.instances = [];
  vi.stubGlobal('EventSource', MockEventSource);

  vi.mocked(useFetcher).mockReturnValue({
    Form: FetcherFormMock,
    state: 'idle',
    data: undefined,
    submit: vi.fn(),
    load: vi.fn(),
  } as unknown as ReturnType<typeof useFetcher>);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('NoteDetail', () => {
  it('shows the generating state until a NOTE_TAGS_GENERATED message arrives, then renders the tags', () => {
    renderNoteDetail({ note: { ...defaultNote, tags: [] } });

    expect(screen.getByText('Tags are being generated.')).toBeInTheDocument();
    expect(screen.queryByText('Existing Tag')).not.toBeInTheDocument();

    const [eventSource] = MockEventSource.instances;
    expect(eventSource).toBeDefined();

    act(() => {
      eventSource.emit('NOTE_TAGS_GENERATED', {
        tags: [{ id: 'tag-2', name: 'Generated Tag' }],
      });
    });

    expect(
      screen.queryByText('Tags are being generated.')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Generated Tag')).toBeInTheDocument();
  });

  it('opens the dropdown on click and closes it on an outside click', async () => {
    const user = userEvent.setup();
    const { container } = renderNoteDetail();

    // The ellipsis toggle is the first button in the tree; Edit/Delete/
    // Regenerate live inside the dropdown that it controls.
    const toggleButton = screen.getAllByRole('button')[0];
    const dropdown = container.querySelector('[aria-expanded]') as HTMLElement;

    expect(dropdown).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggleButton);
    expect(dropdown).toHaveAttribute('aria-expanded', 'true');

    await user.click(document.body);
    expect(dropdown).toHaveAttribute('aria-expanded', 'false');
  });

  it('sets the generating state and disables the button while regenerating tags', async () => {
    const user = userEvent.setup();
    renderNoteDetail();

    const regenerateButton = screen.getByRole('button', {
      name: /regenerate tags/i,
    });

    expect(regenerateButton).not.toBeDisabled();
    expect(
      screen.queryByText('Tags are being generated.')
    ).not.toBeInTheDocument();

    await user.click(regenerateButton);

    expect(screen.getByText('Tags are being generated.')).toBeInTheDocument();
    expect(regenerateButton).toBeDisabled();
  });

  it('closes the EventSource connection on unmount', () => {
    const { unmount } = renderNoteDetail();

    const [eventSource] = MockEventSource.instances;
    expect(eventSource.closed).toBe(false);

    unmount();

    expect(eventSource.closed).toBe(true);
  });

  it('closes the previous EventSource when navigating to a different note', () => {
    const { rerender } = renderNoteDetail();

    const [firstEventSource] = MockEventSource.instances;
    expect(firstEventSource.closed).toBe(false);

    vi.mocked(useLoaderData).mockReturnValue({
      note: {
        data: {
          note: { id: 'note-2', title: 'Second Note', content: 'More content' },
          tags: [],
        },
      },
      related: { data: [] },
    });

    rerender(<NoteDetail />);

    expect(firstEventSource.closed).toBe(true);
    expect(MockEventSource.instances).toHaveLength(2);
    expect(MockEventSource.instances[1].closed).toBe(false);
  });
});
