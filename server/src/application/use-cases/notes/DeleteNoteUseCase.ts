import { NotFoundError } from '../../../domain/errors/NotFoundError';
import type NoteRepository from '../../../domain/repositories/NoteRepository';
import type SearchService from '../../../domain/services/SearchService';
import { buildJobCancellationKey } from '../../jobs/JobCancellationKey';
import type JobCanceller from '../../ports/JobCanceller';

export default class DeleteNoteUseCase {
  private noteRepository: NoteRepository;
  private searchService: SearchService;
  private jobCanceller: JobCanceller;

  constructor(
    noteRepository: NoteRepository,
    searchService: SearchService,
    jobCanceller: JobCanceller
  ) {
    this.noteRepository = noteRepository;
    this.searchService = searchService;
    this.jobCanceller = jobCanceller;
  }

  async execute(id: string) {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      throw new NotFoundError('Note', id);
    }

    await this.searchService.deleteNote(note.getId(), note.getContent());
    await this.noteRepository.delete(id);

    this.jobCanceller.cancel(
      buildJobCancellationKey('GENERATE_TAGS', note.getId())
    );
  }
}
