export default interface AIService {
  generateTags(content: string): Promise<string[]>;
}
