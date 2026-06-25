import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { NoteFactory } from '../../../tests/factories/Note.factory';
import { TagFactory } from '../../../tests/factories/Tag.factory';
import { FakeNoteRepository } from '../../../tests/fakes/NoteRepository.fake';
import { FakeTagRepository } from '../../../tests/fakes/TagRepository.fake';
import GetSingleNoteUseCase from './GetSingleNoteUseCase';

describe('GetSingleNoteUseCase', () => {
  let getSingleNoteUseCase: GetSingleNoteUseCase;
  let noteRepository: FakeNoteRepository;
  let tagRepository: FakeTagRepository;

  beforeEach(() => {
    noteRepository = new FakeNoteRepository();
    tagRepository = new FakeTagRepository();

    getSingleNoteUseCase = new GetSingleNoteUseCase(
      noteRepository,
      tagRepository
    );
  });

  it('returns note and tags for the provided note id', async () => {
    const note = NoteFactory.build();
    const tagA = TagFactory.build({ name: 'Tag A' });
    const tagB = TagFactory.build({ name: 'Tag B' });

    await noteRepository.save(note);
    await tagRepository.save(tagA);
    await tagRepository.save(tagB);

    await tagRepository.attachTagToNote(note.getId(), tagA.getId());
    await tagRepository.attachTagToNote(note.getId(), tagB.getId());

    const result = await getSingleNoteUseCase.execute(note.getId());

    expect(result.note).toBe(note);
    expect(result.tags).toHaveLength(2);
    expect(result.tags).toEqual(expect.arrayContaining([tagA, tagB]));
  });

  it('returns an empty tags array when the note has no tags', async () => {
    const note = NoteFactory.build();
    await noteRepository.save(note);

    const result = await getSingleNoteUseCase.execute(note.getId());

    expect(result.note).toBe(note);
    expect(result.tags).toEqual([]);
  });

  it('throws NotFoundError on missing note', async () => {
    await expect(
      getSingleNoteUseCase.execute('missing-id')
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
