import type NoteRepository from '../../../domain/repositories/NoteRepository';

export default class GetAllNotesUseCase {
  private noteRepository: NoteRepository;

  constructor(noteRepository: NoteRepository) {
    this.noteRepository = noteRepository;
  }

  async execute() {
    const allNotes = await this.noteRepository.findAll();

    return allNotes;
  }
}
