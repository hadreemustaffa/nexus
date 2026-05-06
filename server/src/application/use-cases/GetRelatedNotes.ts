import Note from '../../domain/entities/Note';
import NoteRepository from '../../domain/repositories/NoteRepository';

export default class GetRelatedNotes {
  constructor(private noteRepository: NoteRepository) {}

  async execute(noteId: string, maxHops: number = 2): Promise<Note[]> {
    const visited = new Set<string>();
    const queue: { id: string; hop: number }[] = [];
    const relatedIds: string[] = [];

    queue.push({ id: noteId, hop: 0 });
    visited.add(noteId);

    while (queue.length > 0) {
      const current = queue.shift();

      if (current && current.hop < maxHops) {
        const neighboursNoteId = await this.noteRepository.findLinks(
          current.id
        );

        neighboursNoteId.forEach((id) => {
          if (!visited.has(id)) {
            visited.add(id);
            queue.push({ id: id, hop: current.hop + 1 });
            relatedIds.push(id);
          }
        });
      }
    }

    const relatedNotes = await Promise.all(
      relatedIds.map((id) => {
        const note = this.noteRepository.findById(id);

        return note;
      })
    );

    return relatedNotes.filter((note): note is Note => note !== null);
  }
}
