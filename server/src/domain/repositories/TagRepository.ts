import Note from '../entities/Note';
import Tag from '../entities/Tag';

export default interface TagRepository {
  save(tag: Tag): Promise<void>;
  findById(id: string): Promise<Tag | null>;
  findAll(): Promise<Tag[]>;
  findAllByNoteId(noteId: string): Promise<Tag[]>;
  attachTagToNote(noteId: string, tagId: string): Promise<void>;
  findByName(name: string): Promise<Tag | null>;
  deleteByNoteId(noteId: string): Promise<void>;
}
