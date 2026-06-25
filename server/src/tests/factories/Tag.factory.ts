import Tag from '../../domain/entities/Tag';

interface TagFactoryOverrides {
  name?: string;
}

export class TagFactory {
  /**
   * Generates a Tag object with defaults.
   */
  static build(overrides: TagFactoryOverrides = {}): Tag {
    const name = overrides.name ?? 'Test';
    return Tag.create(name);
  }

  /**
   * Generates a list of Tag objects for bulk testing.
   */
  static buildList(count: number, overrides: Partial<Tag> = {}): Tag[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }
}
