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

  it('resolves a wikilink to an existing note, and ignores one with no matching note yet', async () => {
    const existing = Note.create(validTitle, validContent);
    await noteRepository.save(existing);

    const content = validContent.concat(
      ` [[${existing.getTitle()}]] and [[Missing Note Title]]`
    );

    await linkParser.parse('note-1', content);

    const links = await noteRepository.findLinks('note-1');

    expect(links).toEqual([existing.getId()]);
  });

  it('does not save any links when content has no wikilinks', async () => {
    const existing = Note.create(validTitle, validContent);
    await noteRepository.save(existing);

    const noteId = 'note-1';

    await linkParser.parse(noteId, validContent);

    const links = await noteRepository.findLinks(noteId);

    expect(links).toEqual([]);
  });

  it('resolves a previously-missing link once the target note is created', async () => {
    await linkParser.parse('note-1', 'See [[Later Note]]');

    expect(await noteRepository.findLinks('note-1')).toEqual([]);

    const laterNote = Note.create('Later Note', validContent);
    await noteRepository.save(laterNote);

    expect(await noteRepository.findLinks('note-1')).toEqual([
      laterNote.getId(),
    ]);
  });
});
