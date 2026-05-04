import Note from '../../domain/entities/Note';
import Tag from '../../domain/entities/Tag';
import NoteRepository from '../../domain/repositories/NoteRepository';
import TagRepository from '../../domain/repositories/TagRepository';
import AIService from '../../domain/services/AIService';

export default class CreateNote {
  constructor(
    private noteRepository: NoteRepository,
    private tagRepository: TagRepository,
    private aiService: AIService
  ) {}

  async execute(title: string, content: string) {
    const note = Note.create(title, content);

    await this.noteRepository.save(note);

    const filteredLinks = [...note.getContent().matchAll(/\[\[([^\]]+)\]\]/g)]
      .map((match) => match[1])
      .filter(Boolean);

    await Promise.all(
      filteredLinks.map(async (link) => {
        if (!link) return null;

        const relatedNote = await this.noteRepository.findByTitle(link);

        if (relatedNote) {
          await this.noteRepository.saveLink(note.getId(), relatedNote.getId());
        }
      })
    );

    const tagNames = await this.aiService.generateTags(note.getContent());
    const tags: Tag[] = [];

    await Promise.all([
      ...tagNames.map(async (name) => {
        let tag = await this.tagRepository.findByName(name);

        if (!tag) {
          tag = Tag.create(name);
          await this.tagRepository.save(tag);
        }

        await this.tagRepository.attachTagToNote(note.getId(), tag.getId());
        tags.push(tag);
      }),
    ]);

    const result = {
      note: note,
      tags: tags,
    };

    return result;
  }
}
