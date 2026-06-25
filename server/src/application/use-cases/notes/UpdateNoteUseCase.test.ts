import { Mock, MockInstance } from 'vitest';

import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { NoteFactory } from '../../../tests/factories/Note.factory';
import { FakeNoteRepository } from '../../../tests/fakes/NoteRepository.fake';
import { FakeSearchService } from '../../../tests/fakes/SearchService.fake';
import { LinkParser } from '../../ports/LinkParser';
import UpdateNoteUseCase from './UpdateNoteUseCase';

describe('UpdateNoteUseCase', () => {
  let updateNoteUseCase: UpdateNoteUseCase;
  let noteRepository: FakeNoteRepository;
  let searchService: FakeSearchService;
  let updateSpy: MockInstance;
  let indexNoteSpy: MockInstance;
  let deleteNoteSpy: MockInstance;
  let deleteLinkSpy: MockInstance;
  let parseMock: Mock;
  let linkParser: LinkParser;

  beforeEach(() => {
    parseMock = vi.fn().mockResolvedValue(undefined);
    linkParser = {
      parse: parseMock,
    };

    noteRepository = new FakeNoteRepository();
    searchService = new FakeSearchService();

    updateNoteUseCase = new UpdateNoteUseCase(
      noteRepository,
      searchService,
      linkParser
    );

    updateSpy = vi.spyOn(noteRepository, 'update');
    indexNoteSpy = vi.spyOn(searchService, 'indexNote');
    deleteNoteSpy = vi.spyOn(searchService, 'deleteNote');
    deleteLinkSpy = vi.spyOn(noteRepository, 'deleteLink');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the same note when no change is made', async () => {
    const note = NoteFactory.build();
    await noteRepository.save(note);

    const result = await updateNoteUseCase.execute(
      note.getId(),
      note.getTitle(),
      note.getContent()
    );

    expect(result.note.getTitle()).toBe(note.getTitle());
    expect(result.note.getContent()).toBe(note.getContent());
    expect(deleteNoteSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(indexNoteSpy).not.toHaveBeenCalled();
  });

  it('updates and re-indexes note when only title is changed', async () => {
    const note = NoteFactory.build();
    await noteRepository.save(note);

    const result = await updateNoteUseCase.execute(
      note.getId(),
      'updated title',
      note.getContent()
    );

    expect(result.note.getTitle()).toBe('updated title');
    expect(result.note.getContent()).toBe(note.getContent());
    expect(deleteNoteSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(indexNoteSpy).toHaveBeenCalled();
  });

  it('updates, re-indexes and re-parses note when content is changed', async () => {
    const note = NoteFactory.build();
    await noteRepository.save(note);

    const newContent = `${note.getContent()} updated content`;

    const result = await updateNoteUseCase.execute(
      note.getId(),
      note.getTitle(),
      newContent
    );

    expect(result.note.getTitle()).toBe(note.getTitle());
    expect(result.note.getContent()).toBe(newContent);
    expect(deleteNoteSpy).toHaveBeenCalled();
    expect(deleteLinkSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(indexNoteSpy).toHaveBeenCalled();
    expect(parseMock).toHaveBeenCalled();
  });

  it('updates, re-indexes and re-parses note when title and content is changed', async () => {
    const note = NoteFactory.build();
    await noteRepository.save(note);

    const newContent = `${note.getContent()} updated content`;

    const result = await updateNoteUseCase.execute(
      note.getId(),
      'updated title',
      newContent
    );

    expect(result.note.getTitle()).toBe('updated title');
    expect(result.note.getContent()).toBe(newContent);
    expect(deleteNoteSpy).toHaveBeenCalled();
    expect(deleteLinkSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(indexNoteSpy).toHaveBeenCalled();
    expect(parseMock).toHaveBeenCalled();
  });

  it('throws NotFoundError for missing note', async () => {
    const dummyNote = NoteFactory.build();

    await expect(
      updateNoteUseCase.execute(
        'missing-id',
        dummyNote.getTitle(),
        dummyNote.getContent()
      )
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
