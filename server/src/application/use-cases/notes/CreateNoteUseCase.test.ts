import { NOTE_WORD_MIN } from '@nexus/shared';

import { FakeJobDispatcher } from '../../../tests/fakes/JobDispatcher.fake';
import { FakeNoteRepository } from '../../../tests/fakes/NoteRepository.fake';
import { LinkParser } from '../../ports/LinkParser';
import CreateNoteUseCase from './CreateNoteUseCase';

describe('CreateNoteUseCase', () => {
  let createNoteUseCase: CreateNoteUseCase;
  let noteRepository: FakeNoteRepository;
  let jobDispatcher: FakeJobDispatcher<'GENERATE_TAGS'>;

  beforeEach(() => {
    const linkParser: LinkParser = {
      parse: vi.fn().mockResolvedValue(undefined),
    };

    noteRepository = new FakeNoteRepository();

    jobDispatcher = new FakeJobDispatcher<'GENERATE_TAGS'>();
    createNoteUseCase = new CreateNoteUseCase(
      noteRepository,
      jobDispatcher,
      linkParser
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const validTitle = 'Note Title';
  const validContent = Array(NOTE_WORD_MIN).fill('word').join(' ');

  it('creates and saves the note', async () => {
    const result = await createNoteUseCase.execute(validTitle, validContent);

    expect(result).toHaveProperty('note');
    expect(result.note.getTitle()).toBe(validTitle);
    expect(result.note.getContent()).toBe(validContent);
    expect(result.note.getId()).toBeDefined();
    expect(result.note.getCreatedAt()).toBeInstanceOf(Date);
    expect(result.note.getUpdatedAt()).toBeInstanceOf(Date);

    const savedNote = await noteRepository.findById(result.note.getId());
    expect(savedNote).not.toBeNull();
    expect(savedNote?.getTitle()).toBe(validTitle);
    expect(savedNote?.getContent()).toBe(validContent);
  });

  it('dispatches job with the note id and content', async () => {
    const result = await createNoteUseCase.execute(validTitle, validContent);

    expect(jobDispatcher.jobs).toHaveLength(1);
    expect(jobDispatcher.jobs[0]).toEqual({
      noteId: result.note.getId(),
      content: result.note.getContent(),
    });
  });
});
