import { http, HttpResponse } from 'msw';

import { server } from '../../../tests/mocks/server';
import type { Note } from '../types';
import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  getRelatedNotes,
  regenerateNoteTags,
  searchNotes,
  updateNote,
} from './notes.api';

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const buildNote = (overrides: Partial<Note> = {}): Note => ({
  id: '1',
  title: 'Test Note',
  content: 'This is a test note.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

it('createNote POSTs to the notes root route with title and content as the body', async () => {
  const newNote = { title: 'Test Note', content: 'This is a test note.' };
  const createdNote = buildNote(newNote);

  let capturedBody: unknown;

  server.use(
    http.post('http://localhost:3000/notes/create', async ({ request }) => {
      capturedBody = await request.json();
      return HttpResponse.json(
        {
          message: 'Note created successfully.',
          data: { note: createdNote },
        },
        { status: 201 }
      );
    })
  );

  const result = await createNote(newNote);

  expect(capturedBody).toEqual(newNote);
  expect(result).toEqual({
    message: 'Note created successfully.',
    data: { note: createdNote },
  });
});

it('getNotes GETs the notes root route and returns the wrapped list of notes', async () => {
  const notes = [buildNote({ id: '1' }), buildNote({ id: '2' })];

  server.use(
    http.get('http://localhost:3000/notes', () => {
      return HttpResponse.json({
        message: 'Found notes.',
        data: { notes },
      });
    })
  );

  const result = await getNotes();

  expect(result).toEqual({
    message: 'Found notes.',
    data: { notes },
  });
});

it('getNote GETs the note by id and returns the note with its tags', async () => {
  const note = buildNote({ id: '1' });

  server.use(
    http.get(`http://localhost:3000/notes/${note.id}`, () => {
      return HttpResponse.json({
        message: 'Note found.',
        data: { note, tags: [] },
      });
    })
  );

  const result = await getNote(note.id);

  expect(result).toEqual({
    message: 'Note found.',
    data: { note, tags: [] },
  });
});

it('getRelatedNotes GETs the related-notes route and returns a plain list of notes', async () => {
  const noteId = '1';
  const relatedNotes = [buildNote({ id: '2' }), buildNote({ id: '3' })];

  server.use(
    http.get(`http://localhost:3000/notes/${noteId}/related`, () => {
      return HttpResponse.json({
        message: 'Found related notes.',
        data: relatedNotes,
      });
    })
  );

  const result = await getRelatedNotes(noteId);

  expect(result).toEqual({
    message: 'Found related notes.',
    data: relatedNotes,
  });
});

it('updateNote PUTs to the note by id and returns the updated note', async () => {
  const noteId = '1';
  const updateData = { title: 'Updated Note', content: 'Updated content.' };
  const updatedNote = buildNote({ id: noteId, ...updateData });

  let capturedBody: unknown;

  server.use(
    http.put(`http://localhost:3000/notes/${noteId}`, async ({ request }) => {
      capturedBody = await request.json();
      return HttpResponse.json({
        message: 'Note updated succesfully.',
        data: { note: updatedNote },
      });
    })
  );

  const result = await updateNote(noteId, updateData);

  expect(capturedBody).toEqual(updateData);
  expect(result).toEqual({
    message: 'Note updated succesfully.',
    data: { note: updatedNote },
  });
});

it('deleteNote DELETEs the note by id', async () => {
  const noteId = '1';

  server.use(
    http.delete(`http://localhost:3000/notes/${noteId}`, () => {
      return HttpResponse.json({ message: 'Note deleted successfully.' });
    })
  );

  const result = await deleteNote(noteId);

  expect(result).toEqual({ message: 'Note deleted successfully.' });
});

it('searchNotes GETs the search route with the query as a query param', async () => {
  const query = 'test';
  const searchResults = [{ note: buildNote({ id: '1' }), tags: [] }];

  let capturedUrl: URL | undefined;

  server.use(
    http.get('http://localhost:3000/notes/search', ({ request }) => {
      capturedUrl = new URL(request.url);
      return HttpResponse.json({
        message: 'Search found some notes.',
        data: searchResults,
      });
    })
  );

  const result = await searchNotes(query);

  expect(capturedUrl?.searchParams.get('q')).toBe(query);
  expect(result).toEqual({
    message: 'Search found some notes.',
    data: searchResults,
  });
});

it('searchNotes encodes special characters in the search query exactly once', async () => {
  const query = 'a b&c';
  let capturedUrl: URL | undefined;

  server.use(
    http.get('http://localhost:3000/notes/search', ({ request }) => {
      capturedUrl = new URL(request.url);
      return HttpResponse.json({
        message: 'Search found some notes.',
        data: [],
      });
    })
  );

  await searchNotes(query);

  expect(capturedUrl?.searchParams.get('q')).toBe(query);
});

it('regenerateNoteTags POSTs to the tags route with no body and returns the ack message', async () => {
  const noteId = '1';

  let capturedBody: string;

  server.use(
    http.post(
      `http://localhost:3000/notes/${noteId}/tags`,
      async ({ request }) => {
        capturedBody = await request.text();
        return HttpResponse.json({ message: 'Tag regeneration started.' });
      }
    )
  );

  const result = await regenerateNoteTags(noteId);

  expect(capturedBody!).toBe('');
  expect(result).toEqual({ message: 'Tag regeneration started.' });
});
