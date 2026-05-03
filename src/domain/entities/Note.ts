export default class Note {
  private constructor(
    public readonly id: string,
    private title: string,
    private content: string,
    public readonly created_at: Date,
    public updated_at: Date
  ) {}

  static create(title: string, content: string): Note {
    this.validateTitle(title);

    const wordCount = this.countWords(content);
    if (wordCount < 100) {
      throw new Error('Note cannot be less than 100 words');
    } else if (wordCount > 7500) {
      throw new Error('Note cannot be more than 7500 words');
    }

    const now = new Date();

    return new Note(crypto.randomUUID(), title, content, now, now);
  }

  update(title: string = this.title, content: string = this.content) {
    Note.validateTitle(title);

    if (title === this.title && content === this.content) {
      return;
    }

    if (title !== this.title) {
      this.title = title;
    }

    if (content !== this.content) {
      this.content = content;
    }

    this.updated_at = new Date();
  }

  static fromPersistence(data: {
    id: string;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date;
  }): Note {
    return new Note(
      data.id,
      data.title,
      data.content,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  private static validateTitle(title: string) {
    if (!title) throw new Error('Must provide a title');
  }

  private static countWords(text: string) {
    return (text.match(/\b\w+\b/g) || []).length;
  }

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getContent(): string {
    return this.content;
  }

  getCreatedAt(): Date {
    return this.created_at;
  }

  getUpdatedAt(): Date {
    return this.updated_at;
  }
}
