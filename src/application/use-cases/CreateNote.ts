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

    const tagNames = await this.aiService.generateTags(note.getContent());
    const tags: Tag[] = [];

    await Promise.all(
      tagNames.map(async (name) => {
        const newTag = Tag.create(name);
        await this.tagRepository.save(newTag);
        await this.tagRepository.attachTagToNote(note.getId(), newTag.getId());
        tags.push(newTag);
      })
    );

    const result = {
      note: note,
      tags: tags,
    };

    return result;
  }
}
