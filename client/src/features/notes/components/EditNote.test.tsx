import {
  type ApiErrorResponse,
  countWords,
  NOTE_WORD_MIN,
} from '@nexus/shared';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useFetcher, useLoaderData } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { paths } from '../../../config/paths';
import EditNote from './EditNote';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useFetcher: vi.fn(),
    useLoaderData: vi.fn(),
  };
});

type NoteFixture = { id: string; title: string; content: string };

const validContent = 'Content '.repeat(NOTE_WORD_MIN).trim();
const defaultNote: NoteFixture = {
  id: 'note-1',
  title: 'Existing title',
  content: validContent,
};

type FetcherOverrides = {
  submit?: ReturnType<typeof vi.fn>;
  state?: 'idle' | 'submitting' | 'loading';
  data?: { error?: ApiErrorResponse['error']['details'] };
};

/**
 * Finds the error <span> (if any) rendered next to a given labelled field,
 * without depending on CSS module class names.
 */
function getFieldError(input: HTMLElement) {
  const fieldWrapper = input.closest('div')?.parentElement;
  return fieldWrapper?.querySelector('span') ?? null;
}

function setFetcher(overrides: FetcherOverrides = {}) {
  const submit = overrides.submit ?? vi.fn(() => Promise.resolve(undefined));

  vi.mocked(useFetcher).mockReturnValue({
    submit,
    state: overrides.state ?? 'idle',
    data: overrides.data,
    Form: (() => null) as unknown,
    load: vi.fn(),
  } as unknown as ReturnType<typeof useFetcher>);

  return submit;
}

function renderEditNote(options?: {
  note?: Partial<NoteFixture>;
  fetcher?: FetcherOverrides;
}) {
  const note = { ...defaultNote, ...options?.note };

  vi.mocked(useLoaderData).mockReturnValue({
    data: { note },
  });

  const submit = setFetcher(options?.fetcher);

  const utils = render(
    <MemoryRouter>
      <EditNote />
    </MemoryRouter>
  );

  const rerenderEditNote = () =>
    utils.rerender(
      <MemoryRouter>
        <EditNote />
      </MemoryRouter>
    );

  return { ...utils, rerenderEditNote, submit, note };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('<EditNote />', () => {
  describe('pre-filled fields', () => {
    it('pre-fills the title, content, and word count from loader data', () => {
      const { note } = renderEditNote();

      expect(screen.getByLabelText('Title:')).toHaveValue(note.title);
      expect(screen.getByLabelText('Content:')).toHaveValue(note.content);
      expect(
        screen.getByText(`${countWords(note.content)} words`)
      ).toBeInTheDocument();
    });

    it('links the cancel action back to the note', () => {
      const { note } = renderEditNote();

      expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute(
        'href',
        paths.app.notes.note.getHref(note.id)
      );
    });
  });

  describe('server-side error', () => {
    it('renders the error message when fetcher.data.error is set', () => {
      renderEditNote({
        fetcher: {
          data: {
            error: [{ field: 'title', message: 'Error on title field.' }],
          },
        },
      });

      expect(screen.getByText('Error on title field.')).toBeInTheDocument();
    });

    it('does not render an error message when the fetcher has no error', () => {
      renderEditNote();

      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('shows an error for each field when both are cleared and submitted', async () => {
      const user = userEvent.setup();
      renderEditNote();

      fireEvent.change(screen.getByLabelText('Title:'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByLabelText('Content:'), {
        target: { value: '' },
      });
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Title:'))).not.toBeNull();
      });
      expect(getFieldError(screen.getByLabelText('Content:'))).not.toBeNull();
    });

    it('shows only a content error when just the content is cleared', async () => {
      const user = userEvent.setup();
      renderEditNote();

      fireEvent.change(screen.getByLabelText('Content:'), {
        target: { value: '' },
      });
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Content:'))).not.toBeNull();
      });
      expect(getFieldError(screen.getByLabelText('Title:'))).toBeNull();
    });

    it('does not call fetcher.submit when the form is invalid', async () => {
      const user = userEvent.setup();
      const { submit } = renderEditNote();

      fireEvent.change(screen.getByLabelText('Title:'), {
        target: { value: '' },
      });
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Title:'))).not.toBeNull();
      });
      expect(submit).not.toHaveBeenCalled();
    });

    it('clears an error once the field is fixed and resubmitted', async () => {
      const user = userEvent.setup();
      renderEditNote();

      fireEvent.change(screen.getByLabelText('Title:'), {
        target: { value: '' },
      });
      await user.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Title:'))).not.toBeNull();
      });

      fireEvent.change(screen.getByLabelText('Title:'), {
        target: { value: 'A fixed title' },
      });
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Title:'))).toBeNull();
      });
    });
  });

  describe('word counter debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('does not update the counter until the debounce delay elapses', async () => {
      const { note } = renderEditNote();
      const initialCountText = `${countWords(note.content)} words`;

      fireEvent.change(screen.getByLabelText('Content:'), {
        target: { value: 'hello world' },
      });
      expect(screen.getByText(initialCountText)).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(499);
      });
      expect(screen.getByText(initialCountText)).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(
        screen.getByText(`${countWords('hello world')} words`)
      ).toBeInTheDocument();
    });

    it('only counts the latest value when edits land inside the debounce window', async () => {
      renderEditNote();
      const textarea = screen.getByLabelText('Content:');

      fireEvent.change(textarea, { target: { value: 'four' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });
      fireEvent.change(textarea, { target: { value: 'four five six seven' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      expect(
        screen.getByText(`${countWords('four five six seven')} words`)
      ).toBeInTheDocument();
    });

    it('hides the counter again once the content is cleared', async () => {
      renderEditNote();
      const textarea = screen.getByLabelText('Content:');

      fireEvent.change(textarea, { target: { value: 'hello' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });
      expect(screen.getByText('1 words')).toBeInTheDocument();

      fireEvent.change(textarea, { target: { value: '' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      expect(screen.queryByText(/\d+ words/)).not.toBeInTheDocument();
    });

    it('does not throw if the component unmounts before the debounce fires', () => {
      const { unmount } = renderEditNote();

      fireEvent.change(screen.getByLabelText('Content:'), {
        target: { value: 'hello' },
      });
      unmount();

      expect(() => {
        vi.advanceTimersByTime(500);
      }).not.toThrow();
    });
  });

  describe('submitting to the fetcher', () => {
    it('submits the pre-filled values unchanged, targeting the edit action for that note', async () => {
      const user = userEvent.setup();
      const { submit, note } = renderEditNote();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
      expect(submit).toHaveBeenCalledWith(
        { id: note.id, title: note.title, content: note.content },
        { method: 'post', action: paths.app.notes.edit.getHref(note.id) }
      );
    });

    it('submits updated values after editing the fields', async () => {
      const user = userEvent.setup();
      const { submit, note } = renderEditNote();

      fireEvent.change(screen.getByLabelText('Title:'), {
        target: { value: 'Updated title' },
      });
      fireEvent.change(screen.getByLabelText('Content:'), {
        target: { value: validContent + 'updated' },
      });
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
      expect(submit).toHaveBeenCalledWith(
        {
          id: note.id,
          title: 'Updated title',
          content: validContent + 'updated',
        },
        { method: 'post', action: paths.app.notes.edit.getHref(note.id) }
      );
    });

    it('disables the submit button and the fields, and shows the in-progress label, while the fetcher is submitting', async () => {
      const user = userEvent.setup();
      const { submit, rerenderEditNote } = renderEditNote();

      await user.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));

      // Simulate the fetcher transitioning into the submitting state.
      setFetcher({ submit, state: 'submitting' });
      rerenderEditNote();

      expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
      expect(screen.getByLabelText('Title:')).toBeDisabled();
      expect(screen.getByLabelText('Content:')).toBeDisabled();

      // Simulate the fetcher settling back to idle.
      setFetcher({ submit, state: 'idle' });
      rerenderEditNote();

      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
      expect(screen.getByLabelText('Title:')).toBeEnabled();
      expect(screen.getByLabelText('Content:')).toBeEnabled();
    });

    it('does not resubmit when clicking the button while the fetcher is already submitting', async () => {
      const user = userEvent.setup();
      const submit = vi.fn(() => Promise.resolve(undefined));
      renderEditNote({ fetcher: { submit, state: 'submitting' } });

      const submitButton = screen.getByRole('button', { name: 'Saving...' });
      expect(submitButton).toBeDisabled();

      await user.click(submitButton);

      expect(submit).not.toHaveBeenCalled();
    });
  });
});
