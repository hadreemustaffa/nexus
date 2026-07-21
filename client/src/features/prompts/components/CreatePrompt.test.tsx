import { PROMPT_CHARS_MIN } from '@nexus/shared';
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
import CreatePrompt from './CreatePrompt';

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

function renderCreatePrompt(submitImpl?: () => Promise<unknown>) {
  const submit = vi.fn(submitImpl ?? (() => Promise.resolve(undefined)));

  vi.mocked(useFetcher).mockReturnValue({
    submit,
    state: 'idle',
    data: undefined,
    Form: (() => null) as unknown,
    load: vi.fn(),
  } as unknown as ReturnType<typeof useFetcher>);

  const utils = render(<CreatePrompt />);
  return { ...utils, submit };
}

const validContent = 'content '.repeat(PROMPT_CHARS_MIN).trim();
function fillValidForm() {
  fireEvent.change(screen.getByLabelText('Key:'), {
    target: { value: 'my-prompt-key' },
  });
  fireEvent.change(screen.getByLabelText('Content:'), {
    target: { value: validContent },
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('<CreatePrompt />', () => {
  describe('validation', () => {
    it('shows an error for each field when submitting an empty form', async () => {
      const user = userEvent.setup();
      renderCreatePrompt();

      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Key:'))).not.toBeNull();
      });
      expect(getFieldError(screen.getByLabelText('Content:'))).not.toBeNull();
    });

    it('shows only a content error when just the content is left blank', async () => {
      const user = userEvent.setup();
      renderCreatePrompt();

      fireEvent.change(screen.getByLabelText('Key:'), {
        target: { value: 'a-valid-key' },
      });
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Content:'))).not.toBeNull();
      });
      expect(getFieldError(screen.getByLabelText('Key:'))).toBeNull();
    });

    it('does not call fetcher.submit when the form is invalid', async () => {
      const user = userEvent.setup();
      const { submit } = renderCreatePrompt();

      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Key:'))).not.toBeNull();
      });
      expect(submit).not.toHaveBeenCalled();
    });

    it('clears an error once the field is fixed and resubmitted', async () => {
      const user = userEvent.setup();
      renderCreatePrompt();

      await user.click(screen.getByRole('button', { name: 'Create' }));
      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Key:'))).not.toBeNull();
      });

      fillValidForm();
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(getFieldError(screen.getByLabelText('Key:'))).toBeNull();
      });
      expect(getFieldError(screen.getByLabelText('Content:'))).toBeNull();
    });
  });

  describe('character counter debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('does not update the counter until the debounce delay elapses', async () => {
      renderCreatePrompt();

      fireEvent.change(screen.getByLabelText('Content:'), {
        target: { value: 'hello world' },
      });
      expect(screen.queryByText(/\d+ characters/)).not.toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(499);
      });
      expect(screen.queryByText(/\d+ characters/)).not.toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(screen.getByText('11 characters')).toBeInTheDocument();
    });

    it('only counts the latest value when edits land inside the debounce window', async () => {
      renderCreatePrompt();
      const textarea = screen.getByLabelText('Content:');

      fireEvent.change(textarea, { target: { value: 'one' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });
      fireEvent.change(textarea, { target: { value: 'one two three' } });

      // Still mid-debounce from the second edit — nothing should have
      // committed yet, even though the first edit's 300ms has passed.
      expect(screen.queryByText(/\d+ characters/)).not.toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      expect(screen.getByText('13 characters')).toBeInTheDocument();
    });

    it('hides the counter again once the content is cleared', async () => {
      renderCreatePrompt();
      const textarea = screen.getByLabelText('Content:');

      fireEvent.change(textarea, { target: { value: 'hello' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });
      expect(screen.getByText('5 characters')).toBeInTheDocument();

      fireEvent.change(textarea, { target: { value: '' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      expect(screen.queryByText(/\d+ characters/)).not.toBeInTheDocument();
    });

    it('does not throw if the component unmounts before the debounce fires', () => {
      const { unmount } = renderCreatePrompt();

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
      const { submit } = renderCreatePrompt();

      fillValidForm();
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
      expect(submit).toHaveBeenCalledWith(
        {
          key: 'my-prompt-key',
          content: validContent,
        },
        { method: 'post', action: paths.app.settings.prompts.create.getHref() }
      );
    });

    it('disables the submit button and the fields, and shows the in-progress label, while submitting', async () => {
      const user = userEvent.setup();
      let resolveSubmit: (value: unknown) => void = () => {};
      const pending = new Promise((resolve) => {
        resolveSubmit = resolve;
      });

      renderCreatePrompt(() => pending);

      fillValidForm();
      await user.click(screen.getByRole('button', { name: 'Create' }));

      const submittingButton = await screen.findByRole('button', {
        name: 'Creating...',
      });
      expect(submittingButton).toBeDisabled();
      expect(screen.getByLabelText('Key:')).toBeDisabled();
      expect(screen.getByLabelText('Content:')).toBeDisabled();

      await act(async () => {
        resolveSubmit(undefined);
        await pending;
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
      });
      expect(screen.getByLabelText('Key:')).toBeEnabled();
      expect(screen.getByLabelText('Content:')).toBeEnabled();
    });

    it('ignores a second click while a submission is already in progress', async () => {
      const user = userEvent.setup();
      let resolveSubmit: (value: unknown) => void = () => {};
      const pending = new Promise((resolve) => {
        resolveSubmit = resolve;
      });
      const { submit } = renderCreatePrompt(() => pending);

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
