export default interface PromptService {
  get(key: string): Promise<string>;
}
