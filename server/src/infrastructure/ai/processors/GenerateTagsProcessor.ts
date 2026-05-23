import type EventBus from '../../../application/events/EventBus';
import type { GenerateTagsJob } from '../../../application/jobs/GenerateTagsJob';
import type JobProcessor from '../../../application/jobs/JobProcessor';
import Tag from '../../../domain/entities/Tag';
import type TagRepository from '../../../domain/repositories/TagRepository';
import type AIService from '../../../domain/services/AIService';

export default class GenerateTagsProcessor implements JobProcessor<GenerateTagsJob> {
  private tagRepository: TagRepository;
  private aiService: AIService;
  private eventBus: EventBus;

  constructor(
    tagRepository: TagRepository,
    aiService: AIService,
    eventBus: EventBus
  ) {
    this.tagRepository = tagRepository;
    this.aiService = aiService;
    this.eventBus = eventBus;
  }

  async process(job: GenerateTagsJob): Promise<void> {
    console.log('Processing job for note:', job.noteId);
    const tags = await this.aiService.generateTags(job.content);
    const tagsPayload: Tag[] = [];

    await Promise.all(
      tags.map(async (name) => {
        let tag = await this.tagRepository.findByName(name);

        if (!tag) {
          tag = Tag.create(name);
          await this.tagRepository.save(tag);
        }

        await this.tagRepository.attachTagToNote(job.noteId, tag.getId());

        tagsPayload.push(tag);
      })
    );

    this.eventBus.publish({
      type: 'NOTE_TAGS_GENERATED',
      occurredAt: new Date(),
      payload: {
        noteId: job.noteId,
        tags: tagsPayload,
      },
    });
  }
}
