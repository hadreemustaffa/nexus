import { NOTE_WORD_MIN } from '@nexus/shared';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import NotesSidebar from './NotesSidebar';

describe('NotesSidebar', () => {
  test('renders notes sorted by created_at descending', () => {
    const notes = [
      {
        id: '1',
        title: 'First',
        content: Array(NOTE_WORD_MIN).fill('word').join(' '),
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z',
      },
      {
        id: '2',
        title: 'Second',
        content: Array(NOTE_WORD_MIN).fill('word').join(' '),
        created_at: '2021-01-01T00:00:00Z',
        updated_at: '2021-01-01T00:00:00Z',
      },
      {
        id: '3',
        title: 'Third',
        content: Array(NOTE_WORD_MIN).fill('word').join(' '),
        created_at: '2019-01-01T00:00:00Z',
        updated_at: '2019-01-01T00:00:00Z',
      },
    ];

    render(
      <MemoryRouter>
        <NotesSidebar notes={notes} />
      </MemoryRouter>
    );

    const items = screen.getAllByRole('heading', { level: 2 });
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Second');
    expect(items[1]).toHaveTextContent('First');
    expect(items[2]).toHaveTextContent('Third');
  });

  test('renders the empty-state message when given an empty list', () => {
    render(
      <MemoryRouter>
        <NotesSidebar notes={[]} />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Nothing here yet — start by creating a note\./i)
    ).toBeInTheDocument();
  });

  test('renders the "New" create-note link', () => {
    render(
      <MemoryRouter>
        <NotesSidebar notes={[]} />
      </MemoryRouter>
    );

    expect(screen.getByText(/^New/i)).toBeInTheDocument();
  });
});
