import { assertNoteTitle, assertNoteWordCount } from '../note/noteValidators';

export default class Note {
  public readonly id: string;
  private title: string;
  private content: string;
  public readonly created_at: Date;
  public updated_at: Date;

  constructor(
    id: string,
    title: string,
    content: string,
    created_at: Date,
    updated_at: Date
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static create(title: string, content: string): Note {
    assertNoteTitle(title);
    assertNoteWordCount(content);

    const now = new Date();

    return new Note(crypto.randomUUID(), title.trim(), content, now, now);
  }

  update(title: string = this.title, content: string = this.content): void {
    assertNoteTitle(title);
    assertNoteWordCount(content);

    if (title === this.title && content === this.content) {
      return;
    }

    this.title = title.trim();
    this.content = content;
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
