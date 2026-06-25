import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { NoteFactory } from '../../../tests/factories/Note.factory';
import { TagFactory } from '../../../tests/factories/Tag.factory';
import { FakeJobDispatcher } from '../../../tests/fakes/JobDispatcher.fake';
import { FakeNoteRepository } from '../../../tests/fakes/NoteRepository.fake';
import { FakeTagRepository } from '../../../tests/fakes/TagRepository.fake';
import RegenerateNoteTagsUseCase from './RegenerateNoteTagsUseCase';

describe('RegenerateNoteTagsUseCase', () => {
  let regenerateNoteTagsUseCase: RegenerateNoteTagsUseCase;
  let noteRepository: FakeNoteRepository;
  let tagRepository: FakeTagRepository;
  let dispatcher: FakeJobDispatcher<'GENERATE_TAGS'>;

  beforeEach(() => {
    noteRepository = new FakeNoteRepository();
    tagRepository = new FakeTagRepository();
    dispatcher = new FakeJobDispatcher<'GENERATE_TAGS'>();

    regenerateNoteTagsUseCase = new RegenerateNoteTagsUseCase(
      noteRepository,
      tagRepository,
      dispatcher
    );
  });

  it('deletes existing tags and dispatches a regenerate job for the note', async () => {
    const note = NoteFactory.build();
    const tagA = TagFactory.build({ name: 'Tag A' });
    const tagB = TagFactory.build({ name: 'Tag B' });

    await noteRepository.save(note);
    await tagRepository.save(tagA);
    await tagRepository.save(tagB);

    await tagRepository.attachTagToNote(note.getId(), tagA.getId());
    await tagRepository.attachTagToNote(note.getId(), tagB.getId());

    await regenerateNoteTagsUseCase.execute(note.getId());

    const tags = await tagRepository.findAllByNoteId(note.getId());

    expect(tags).toEqual([]);
    expect(dispatcher.jobs).toEqual([
      {
        noteId: note.getId(),
        content: note.getContent(),
      },
    ]);
  });

  it('throws NotFoundError when note does not exist', async () => {
    await expect(
      regenerateNoteTagsUseCase.execute('missing-id')
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
