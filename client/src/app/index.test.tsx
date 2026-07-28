import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { paths } from '../config/paths';

vi.mock('../features/notes/api/notes.api', () => ({
  getNotes: vi.fn().mockResolvedValue({ data: { notes: [] } }),
  getNote: vi.fn(),
  getRelatedNotes: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  regenerateNoteTags: vi.fn(),
}));

vi.mock('../features/prompts/api/prompts.api', () => ({
  getAllPrompts: vi.fn().mockResolvedValue({ data: { prompts: [] } }),
  createPrompt: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

describe('App', () => {
  it('resolves the root route through the real provider + router', async () => {
    // createBrowserRouter runs at module scope in Router.tsx, so the URL
    // must be set before that module is evaluated.
    window.history.pushState({}, '', paths.app.root.path);

    const { App } = await import('./index');

    render(<App />);

    expect(await screen.findByText('Select a note')).toBeInTheDocument();
  });
});
