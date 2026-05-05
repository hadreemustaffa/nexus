import Tag from '../../domain/entities/Tag';
import NoteRepository from '../../domain/repositories/NoteRepository';
import TagRepository from '../../domain/repositories/TagRepository';
import AIService from '../../domain/services/AIService';

export default class GenerateAndAttachTags {
  constructor(
    private tagRepository: TagRepository,
    private aiService: AIService
  ) {}

  async execute(noteId: string, content: string): Promise<Tag[]> {
    const tagNames = await this.aiService.generateTags(content);
    const tags: Tag[] = [];

    await Promise.all(
      tagNames.map(async (name) => {
        let tag = await this.tagRepository.findByName(name);
        if (!tag) {
          tag = Tag.create(name);
          await this.tagRepository.save(tag);
        }

        await this.tagRepository.attachTagToNote(noteId, tag.getId());
        tags.push(tag);
      })
    );

    return tags;
  }
}
