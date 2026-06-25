export interface LinkParser {
  parse(noteId: string, content: string): Promise<void>;
}
