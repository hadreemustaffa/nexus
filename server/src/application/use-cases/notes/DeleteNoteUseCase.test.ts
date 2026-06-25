import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { NoteFactory } from '../../../tests/factories/Note.factory';
import { FakeNoteRepository } from '../../../tests/fakes/NoteRepository.fake';
import { FakeSearchService } from '../../../tests/fakes/SearchService.fake';
import DeleteNoteUseCase from './DeleteNoteUseCase';

describe('DeleteNoteUseCase', () => {
  let deleteNoteUseCase: DeleteNoteUseCase;
  let noteRepository: FakeNoteRepository;
  let searchService: FakeSearchService;

  beforeEach(() => {
    noteRepository = new FakeNoteRepository();
    searchService = new FakeSearchService();
    deleteNoteUseCase = new DeleteNoteUseCase(noteRepository, searchService);
  });

  it('deletes note and removes it from search index', async () => {
    const note = NoteFactory.build();

    await noteRepository.save(note);
    await deleteNoteUseCase.execute(note.getId());

    const deleted = await noteRepository.findById(note.getId());

    expect(deleted).toBeNull();
    expect(searchService.indexedNotes).not.toContainEqual(
      expect.objectContaining({
        noteId: note.getId(),
      })
    );
  });

  it('throws NotFoundError for missing note', async () => {
    await expect(deleteNoteUseCase.execute('test-id')).rejects.toBeInstanceOf(
      NotFoundError
    );
  });
});
