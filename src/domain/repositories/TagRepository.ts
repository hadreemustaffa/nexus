import Note from '../entities/Note';
import Tag from '../entities/Tag';

export default interface TagRepository {
  save(tag: Tag): Promise<void>;
  findById(id: string): Promise<Tag | null>;
  findAll(): Promise<Tag[]>;
  findAllByNoteId(note_id: Note['id']): Promise<Tag[]>;
  attachTagToNote(note_id: Note['id'], tag_id: Tag['id']): Promise<void>;
}
