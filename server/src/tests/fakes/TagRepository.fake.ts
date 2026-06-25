import Tag from '../../domain/entities/Tag';
import type TagRepository from '../../domain/repositories/TagRepository';

export class FakeTagRepository implements TagRepository {
  private tags = new Map<string, Tag>();
  private noteTags = new Map<string, Set<string>>();

  async save(tag: Tag): Promise<void> {
    this.tags.set(tag.getId(), tag);
  }

  async findById(id: string): Promise<Tag | null> {
    return this.tags.get(id) ?? null;
  }

  async findAll(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }

  async findAllByNoteId(noteId: string): Promise<Tag[]> {
    const tagIds = this.noteTags.get(noteId);

    if (!tagIds) return [];

    return Array.from(tagIds)
      .map((tagId) => this.tags.get(tagId))
      .filter((tag): tag is Tag => tag !== undefined);
  }

  async attachTagToNote(noteId: string, tagId: string): Promise<void> {
    let tagIds = this.noteTags.get(noteId);

    if (!tagIds) {
      tagIds = new Set();
      this.noteTags.set(noteId, tagIds);
    }

    tagIds.add(tagId);
  }

  async findByName(name: string): Promise<Tag | null> {
    for (const tag of this.tags.values()) {
      if (tag.getName() === name) {
        return tag;
      }
    }

    return null;
  }

  async deleteByNoteId(noteId: string): Promise<void> {
    this.noteTags.delete(noteId);
  }
}
