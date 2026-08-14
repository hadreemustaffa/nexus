export default interface AIService {
  generateTags(content: string, signal?: AbortSignal): Promise<string[]>;
}
