import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { NoteFactory } from '../../../tests/factories/Note.factory';
import { FakeNoteRepository } from '../../../tests/fakes/NoteRepository.fake';
import GetRelatedNotesUseCase from './GetRelatedNotesUseCase';

describe('GetRelatedNotesUseCase', () => {
  let getRelatedNotesUseCase: GetRelatedNotesUseCase;
  let noteRepository: FakeNoteRepository;

  beforeEach(() => {
    noteRepository = new FakeNoteRepository();
    getRelatedNotesUseCase = new GetRelatedNotesUseCase(noteRepository);
  });

  it('finds only direct links when maxHops is 1', async () => {
    const MAX_HOPS = 1;

    const noteA = NoteFactory.build({ title: 'Note A' });
    const noteB = NoteFactory.build({ title: 'Note B' });
    const noteC = NoteFactory.build({ title: 'Note C' });

    await noteRepository.save(noteA);
    await noteRepository.save(noteB);
    await noteRepository.save(noteC);

    await noteRepository.saveLink(noteA.getId(), noteB.getId());
    await noteRepository.saveLink(noteB.getId(), noteC.getId());

    const result = await getRelatedNotesUseCase.execute(
      noteA.getId(),
      MAX_HOPS
    );

    expect(result.map((note) => note.getId())).toEqual([noteB.getId()]);
  });

  it('finds links up to the provided maxHops', async () => {
    const noteA = NoteFactory.build({ title: 'Note A' });
    const noteB = NoteFactory.build({ title: 'Note B' });
    const noteC = NoteFactory.build({ title: 'Note C' });
    const noteD = NoteFactory.build({ title: 'Note D' });

    await noteRepository.save(noteA);
    await noteRepository.save(noteB);
    await noteRepository.save(noteC);
    await noteRepository.save(noteD);

    await noteRepository.saveLink(noteA.getId(), noteB.getId());
    await noteRepository.saveLink(noteB.getId(), noteC.getId());
    await noteRepository.saveLink(noteC.getId(), noteD.getId());

    const result = await getRelatedNotesUseCase.execute(noteA.getId());

    expect(result.map((note) => note.getId())).toEqual([
      noteB.getId(),
      noteC.getId(),
    ]);
  });

  it('includes deeper linked notes when maxHops increases', async () => {
    const MAX_HOPS = 3;

    const noteA = NoteFactory.build({ title: 'Note A' });
    const noteB = NoteFactory.build({ title: 'Note B' });
    const noteC = NoteFactory.build({ title: 'Note C' });
    const noteD = NoteFactory.build({ title: 'Note D' });

    await noteRepository.save(noteA);
    await noteRepository.save(noteB);
    await noteRepository.save(noteC);
    await noteRepository.save(noteD);

    await noteRepository.saveLink(noteA.getId(), noteB.getId());
    await noteRepository.saveLink(noteB.getId(), noteC.getId());
    await noteRepository.saveLink(noteC.getId(), noteD.getId());

    const result = await getRelatedNotesUseCase.execute(
      noteA.getId(),
      MAX_HOPS
    );

    expect(result.map((note) => note.getId())).toEqual([
      noteB.getId(),
      noteC.getId(),
      noteD.getId(),
    ]);
  });

  it('does not return duplicate notes when links form a cycle', async () => {
    const MAX_HOPS = 3;

    const noteA = NoteFactory.build({ title: 'Note A' });
    const noteB = NoteFactory.build({ title: 'Note B' });
    const noteC = NoteFactory.build({ title: 'Note C' });

    await noteRepository.save(noteA);
    await noteRepository.save(noteB);
    await noteRepository.save(noteC);

    await noteRepository.saveLink(noteA.getId(), noteB.getId());
    await noteRepository.saveLink(noteB.getId(), noteC.getId());
    // related to first note
    await noteRepository.saveLink(noteC.getId(), noteA.getId());

    const result = await getRelatedNotesUseCase.execute(
      noteA.getId(),
      MAX_HOPS
    );

    expect(result.map((note) => note.getId())).toEqual([
      noteB.getId(),
      noteC.getId(),
    ]);
  });

  it('returns [] when maxHops is 0', async () => {
    const MAX_HOPS = 0;

    const noteA = NoteFactory.build({ title: 'Note A' });
    const noteB = NoteFactory.build({ title: 'Note B' });

    await noteRepository.save(noteA);
    await noteRepository.save(noteB);
    await noteRepository.saveLink(noteA.getId(), noteB.getId());

    const result = await getRelatedNotesUseCase.execute(
      noteA.getId(),
      MAX_HOPS
    );

    expect(result).toEqual([]);
  });

  it('returns [] for note with no related links', async () => {
    const notes = NoteFactory.buildList(2);

    await Promise.all(notes.map((note) => noteRepository.save(note)));

    const links = await getRelatedNotesUseCase.execute(notes[0].getId());

    expect(links).toEqual([]);
  });

  it('throws NotFoundError for missing note', async () => {
    await expect(
      getRelatedNotesUseCase.execute('missing-id')
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
