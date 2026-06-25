import { NoteFactory } from '../../../tests/factories/Note.factory';
import { FakeNoteRepository } from '../../../tests/fakes/NoteRepository.fake';
import GetAllNotesUseCase from './GetAllNotesUseCase';

describe('GetAllNotesUseCase', () => {
  let getAllNotesUseCase: GetAllNotesUseCase;
  let noteRepository: FakeNoteRepository;

  beforeEach(() => {
    noteRepository = new FakeNoteRepository();
    getAllNotesUseCase = new GetAllNotesUseCase(noteRepository);
  });

  it('returns the correct number of notes', async () => {
    const notes = NoteFactory.buildList(10);

    await Promise.all(notes.map((note) => noteRepository.save(note)));

    const result = await getAllNotesUseCase.execute();

    expect(result).toHaveLength(notes.length);
    expect(result).toEqual(notes);
  });

  it('returns an empty array when no notes exist', async () => {
    const result = await getAllNotesUseCase.execute();

    expect(result).toEqual([]);
  });
});
