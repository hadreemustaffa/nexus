import { NOTE_WORD_MIN } from '@nexus/shared';

import Note from '../../domain/entities/Note';
import { FakeNoteRepository } from '../../tests/fakes/NoteRepository.fake';
import LinkParsingService from './LinkParsingService';

describe('LinkParsingService', () => {
  let noteRepository: FakeNoteRepository;
  let linkParser: LinkParsingService;

  beforeEach(() => {
    noteRepository = new FakeNoteRepository();
    linkParser = new LinkParsingService(noteRepository);
  });

  const validTitle = 'Test Title';
  const validContent = Array(NOTE_WORD_MIN).fill('word').join(' ');

  it('saves a link only when a wikilink resolves to an existing note', async () => {
    const existing = Note.create(validTitle, validContent);
    await noteRepository.save(existing);

    const content = validContent.concat(
      ` [[${existing.getTitle()}]] and [[Missing Note Title]]`
    );

    const noteId = 'note-1';

    await linkParser.parse(noteId, content);

    const links = await noteRepository.findLinks(noteId);

    expect(links).toHaveLength(1);
    expect(links[0]).toBe(existing.getId());
  });

  it('does not save any links when content has no wikilinks', async () => {
    const existing = Note.create(validTitle, validContent);
    await noteRepository.save(existing);

    const noteId = 'note-1';

    await linkParser.parse(noteId, validContent);

    const links = await noteRepository.findLinks(noteId);

    expect(links).toEqual([]);
  });
});
