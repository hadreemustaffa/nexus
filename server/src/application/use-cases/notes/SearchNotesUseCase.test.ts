import { NoteFactory } from '../../../tests/factories/Note.factory';
import { TagFactory } from '../../../tests/factories/Tag.factory';
import { FakeNoteRepository } from '../../../tests/fakes/NoteRepository.fake';
import { FakeSearchService } from '../../../tests/fakes/SearchService.fake';
import { FakeTagRepository } from '../../../tests/fakes/TagRepository.fake';
import SearchNotesUseCase from './SearchNotesUseCase';

describe('SearchNotesUseCase', () => {
  let searchNotesUseCase: SearchNotesUseCase;
  let noteRepository: FakeNoteRepository;
  let tagRepository: FakeTagRepository;
  let searchService: FakeSearchService;
  let query: string;

  beforeEach(() => {
    noteRepository = new FakeNoteRepository();
    tagRepository = new FakeTagRepository();
    searchService = new FakeSearchService();

    searchNotesUseCase = new SearchNotesUseCase(
      noteRepository,
      tagRepository,
      searchService
    );

    // query content is not relevant in these tests
    // FakeSearchService is stub-driven: search results are set explicitly
    // with searchService.setSearchResults(), while actual matching/scoring belongs
    // in InMemorySearchService tests
    query = 'dummy query';
  });

  it('returns notes with tags for search results', async () => {
    const note = NoteFactory.build();
    const tag = TagFactory.build();

    await noteRepository.save(note);
    await tagRepository.save(tag);
    await tagRepository.attachTagToNote(note.getId(), tag.getId());

    searchService.setSearchResults([{ noteId: note.getId(), score: 1 }]);

    const result = await searchNotesUseCase.execute(query);

    expect(searchService.searchedQueries).toEqual([query]);
    expect(result).toEqual([
      {
        note,
        tags: [tag],
      },
    ]);
  });

  it('returns matched notes with empty tags when a note has no tags', async () => {
    const noteA = NoteFactory.build();
    const noteB = NoteFactory.build();
    const tagA = TagFactory.build({ name: 'TagA' });

    await noteRepository.save(noteA);
    await noteRepository.save(noteB);

    await tagRepository.save(tagA);
    await tagRepository.attachTagToNote(noteA.getId(), tagA.getId());

    searchService.setSearchResults([
      { noteId: noteA.getId(), score: 1 },
      { noteId: noteB.getId(), score: 1 },
    ]);

    const result = await searchNotesUseCase.execute(query);

    expect(searchService.searchedQueries).toEqual([query]);
    expect(result).toEqual([
      {
        note: noteA,
        tags: [tagA],
      },
      {
        note: noteB,
        tags: [],
      },
    ]);
  });

  it('skips search results whose note does not exist', async () => {
    const existingNote = NoteFactory.build();
    const missingNoteId = 'missing-note-id';

    await noteRepository.save(existingNote);

    searchService.setSearchResults([
      { noteId: existingNote.getId(), score: 1 },
      { noteId: missingNoteId, score: 1 },
    ]);

    const result = await searchNotesUseCase.execute(query);

    expect(result).toEqual([
      {
        note: existingNote,
        tags: [],
      },
    ]);
  });
});
