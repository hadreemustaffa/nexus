import NoteRepository from '../../domain/repositories/NoteRepository';

export default class ParseAndSaveLinks {
  constructor(private noteRepository: NoteRepository) {}

  async execute(noteId: string, content: string): Promise<void> {
    const links = [...content.matchAll(/\[\[([^\]]+)\]\]/g)]
      .map((match) => match[1])
      .filter(Boolean);

    await Promise.all(
      links.map(async (link) => {
        const relatedNote = await this.noteRepository.findByTitle(link);
        if (relatedNote) {
          await this.noteRepository.saveLink(noteId, relatedNote.getId());
        }
      })
    );
  }
}
