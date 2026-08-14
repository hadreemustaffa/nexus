import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { NoteFactory } from '../../../tests/factories/Note.factory';
import FakeJobCanceller from '../../../tests/fakes/JobCanceller.fake';
import { FakeNoteRepository } from '../../../tests/fakes/NoteRepository.fake';
import { FakeSearchService } from '../../../tests/fakes/SearchService.fake';
import { buildJobCancellationKey } from '../../jobs/JobCancellationKey';
import DeleteNoteUseCase from './DeleteNoteUseCase';

describe('DeleteNoteUseCase', () => {
  let deleteNoteUseCase: DeleteNoteUseCase;
  let noteRepository: FakeNoteRepository;
  let searchService: FakeSearchService;
  let jobCanceller: FakeJobCanceller;

  beforeEach(() => {
    noteRepository = new FakeNoteRepository();
    searchService = new FakeSearchService();
    jobCanceller = new FakeJobCanceller();
    deleteNoteUseCase = new DeleteNoteUseCase(
      noteRepository,
      searchService,
      jobCanceller
    );
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

  it('cancel with correct key on successful delete', async () => {
    const note = NoteFactory.build();
    await noteRepository.save(note);

    await deleteNoteUseCase.execute(note.getId());

    expect(jobCanceller.cancelledKeys).toHaveLength(1);
    expect(jobCanceller.cancelledKeys).toContain(
      buildJobCancellationKey('GENERATE_TAGS', note.getId())
    );
  });

  it('does not call cancel when the note is not found', async () => {
    await expect(
      deleteNoteUseCase.execute('missing-id')
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(jobCanceller.cancelledKeys).toHaveLength(0);
  });
});
