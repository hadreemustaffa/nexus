import { NOTE_WORD_MIN } from '@nexus/shared';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFetcher } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '../../../config/paths';
import CreateNote from './CreateNote';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useFetcher: vi.fn(),
  };
});

/**
 * Finds the error <span> (if any) rendered next to a given labelled field,
 * without depending on CSS module class names.
 */
function getFieldError(input: HTMLElement) {
  const fieldWrapper = input.closest('div')?.parentElement;
  return fieldWrapper?.querySelector('span') ?? null;
}

function renderCreateNote(submitImpl?: () => Promise<unknown>) {
  const submit = vi.fn(submitImpl ?? (() => Promise.resolve(undefined)));

  vi.mocked(useFetcher).mockReturnValue({
    submit,
    state: 'idle',
    data: undefined,
    Form: (() => null) as unknown,
    load: vi.fn(),
  } as unknown as ReturnType<typeof useFetcher>);

  const utils = render(<CreateNote />);
  return { ...utils, submit };
}

const validContent = 'Word '.repeat(NOTE_WORD_MIN).trim();
function fillValidForm() {
  fireEvent.change(screen.getByLabelText('Title:'), {
    target: { value: 'My first note' },
  });
  fireEvent.change(screen.getByLabelText('Content:'), {
    target: { value: validContent },
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('<CreateNote />', () => {
  describe('validation', () => {
    it('shows an error for each field when submitting an empty form', async () => {
      const user = userEvent.setup();
      renderCreateNote();

      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Title:'))).not.toBeNull();
      });
      expect(getFieldError(screen.getByLabelText('Content:'))).not.toBeNull();
    });

    it('shows only a content error when just the content is left blank', async () => {
      const user = userEvent.setup();
      renderCreateNote();

      fireEvent.change(screen.getByLabelText('Title:'), {
        target: { value: 'A valid title' },
      });
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Content:'))).not.toBeNull();
      });
      expect(getFieldError(screen.getByLabelText('Title:'))).toBeNull();
    });

    it('does not call fetcher.submit when the form is invalid', async () => {
      const user = userEvent.setup();
      const { submit } = renderCreateNote();

      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Title:'))).not.toBeNull();
      });
      expect(submit).not.toHaveBeenCalled();
    });

    it('clears an error once the field is fixed and resubmitted', async () => {
      const user = userEvent.setup();
      renderCreateNote();

      await user.click(screen.getByRole('button', { name: 'Create' }));
      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Title:'))).not.toBeNull();
      });

      fillValidForm();
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Title:'))).toBeNull();
      });
      expect(getFieldError(screen.getByLabelText('Content:'))).toBeNull();
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
      renderCreateNote();

      fireEvent.change(screen.getByLabelText('Content:'), {
        target: { value: 'hello world' },
      });
      expect(screen.queryByText(/\d+ words/)).not.toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(499);
      });
      expect(screen.queryByText(/\d+ words/)).not.toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(screen.getByText('2 words')).toBeInTheDocument();
    });

    it('only counts the latest value when edits land inside the debounce window', async () => {
      renderCreateNote();
      const textarea = screen.getByLabelText('Content:');

      fireEvent.change(textarea, { target: { value: 'one' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });
      fireEvent.change(textarea, { target: { value: 'one two three' } });

      // Still mid-debounce from the second edit — nothing should have
      // committed yet, even though the first edit's 300ms has passed.
      expect(screen.queryByText(/\d+ words/)).not.toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      expect(screen.getByText('3 words')).toBeInTheDocument();
    });

    it('hides the counter again once the content is cleared', async () => {
      renderCreateNote();
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
      const { unmount } = renderCreateNote();

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
    it('calls fetcher.submit with the right action and form values', async () => {
      const user = userEvent.setup();
      const { submit } = renderCreateNote();

      fillValidForm();
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
      expect(submit).toHaveBeenCalledWith(
        {
          title: 'My first note',
          content: validContent,
        },
        { method: 'post', action: paths.app.notes.create.getHref() }
      );
    });

    it('ignores a second click while a submission is already in progress', async () => {
      const user = userEvent.setup();
      let resolveSubmit: (value: unknown) => void = () => {};
      const pending = new Promise((resolve) => {
        resolveSubmit = resolve;
      });
      const { submit } = renderCreateNote(() => pending);

      fillValidForm();
      const submitButton = screen.getByRole('button', { name: 'Create' });
      await user.click(submitButton);
      await screen.findByRole('button', { name: 'Creating...' });

      // The button is disabled now, so this click should be a no-op.
      await user.click(submitButton);

      await act(async () => {
        resolveSubmit(undefined);
        await pending;
      });

      expect(submit).toHaveBeenCalledTimes(1);
    });
  });
});
