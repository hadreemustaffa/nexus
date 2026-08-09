import NoteRepository from '../../domain/repositories/NoteRepository';
import { LinkParser } from '../ports/LinkParser';

export default class LinkParsingService implements LinkParser {
  private noteRepository: NoteRepository;

  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository;
  }

  async parse(noteId: string, content: string): Promise<void> {
    const titles = [...content.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)]
      .map((match) => match[1].trim())
      .filter(Boolean);

    await Promise.all(
      titles.map(async (title) => {
        await this.noteRepository.saveLink(noteId, title);
      })
    );
  }
}
