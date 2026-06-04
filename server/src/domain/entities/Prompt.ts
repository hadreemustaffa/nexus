export default class Prompt {
  public readonly id: string;
  public readonly key: string;
  public readonly content: string;
  public readonly version: number;
  public readonly isDefault: boolean;
  public readonly isActive: boolean;
  public readonly createdAt: Date;

  constructor(
    id: string,
    key: string,
    content: string,
    version: number,
    isDefault: boolean,
    isActive: boolean,
    createdAt: Date
  ) {
    this.id = id;
    this.key = key;
    this.content = content;
    this.version = version;
    this.isDefault = isDefault;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }

  static createDefault(key: string, content: string): Prompt {
    return new Prompt(
      crypto.randomUUID(),
      key,
      content,
      1,
      true,
      true,
      new Date()
    );
  }

  static create(key: string, content: string, version: number = 1): Prompt {
    return new Prompt(
      crypto.randomUUID(),
      key,
      content,
      version,
      false,
      false,
      new Date()
    );
  }

  static fromPersistence(data: {
    id: string;
    key: string;
    content: string;
    version: number;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
  }): Prompt {
    return new Prompt(
      data.id,
      data.key,
      data.content,
      data.version,
      data.isDefault,
      data.isActive,
      new Date(data.createdAt)
    );
  }

  get isEditable(): boolean {
    return !this.isDefault;
  }

  get isDeletable(): boolean {
    return !this.isDefault;
  }

  get isActivatable(): boolean {
    return !this.isActive;
  }
}
