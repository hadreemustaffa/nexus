import { ValidationError } from '../errors/ValidationError';

export default class Tag {
  public readonly id: string;
  public readonly name: string;
  public readonly created_at: Date;

  constructor(id: string, name: string, created_at: Date) {
    this.id = id;
    this.name = name;
    this.created_at = created_at;
  }

  static create(name: string): Tag {
    this.assertTagName(name);

    const normalizedName = this.normalizeName(name);

    return new Tag(crypto.randomUUID(), normalizedName, new Date());
  }

  static fromPersistence(data: {
    id: string;
    name: string;
    created_at: Date;
  }): Tag {
    return new Tag(data.id, data.name, new Date(data.created_at));
  }

  static normalizeName(name: string): string {
    return name.trim().toLowerCase();
  }

  private static assertTagName(title: string) {
    if (!title) {
      throw new ValidationError('Tag name cannot be empty', [
        { field: 'name', message: 'Tag name is required' },
      ]);
    }
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getCreatedAt(): Date {
    return this.created_at;
  }
}
