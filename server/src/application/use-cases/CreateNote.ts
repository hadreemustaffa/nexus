import Note from '../../domain/entities/Note';
import type NoteRepository from '../../domain/repositories/NoteRepository';
import type TagRepository from '../../domain/repositories/TagRepository';
import type AIService from '../../domain/services/AIService';
import GenerateAndAttachTags from './GenerateAndAttachTags';
import ParseAndSaveLinks from './ParseAndSaveLinks';

export default class CreateNote {
  private noteRepository: NoteRepository;
  private tagRepository: TagRepository;
  private aiService: AIService;

  constructor(
    noteRepository: NoteRepository,
    tagRepository: TagRepository,
    aiService: AIService
  ) {
    this.noteRepository = noteRepository;
    this.tagRepository = tagRepository;
    this.aiService = aiService;
  }

  async execute(title: string, content: string) {
    const note = Note.create(title, content);

    await this.noteRepository.save(note);

    const parseAndSaveLinks = new ParseAndSaveLinks(this.noteRepository);
    await parseAndSaveLinks.execute(note.getId(), note.getContent());

    const generateAndAttachTags = new GenerateAndAttachTags(
      this.tagRepository,
      this.aiService
    );

    const tags = await generateAndAttachTags.execute(
      note.getId(),
      note.getContent()
    );

    const result = {
      note: note,
      tags: tags,
    };

    return result;
  }
}
