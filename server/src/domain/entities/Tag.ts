export default class Tag {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly created_at: Date
  ) {}

  static create(name: string): Tag {
    this.validateTitle(name);

    return new Tag(crypto.randomUUID(), name, new Date());
  }

  static fromPersistence(data: {
    id: string;
    name: string;
    created_at: Date;
  }): Tag {
    return new Tag(data.id, data.name, new Date(data.created_at));
  }

  private static validateTitle(title: string) {
    if (!title) throw new Error('Tag name cannot be empty');
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
