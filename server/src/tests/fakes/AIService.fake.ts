import AIService from '../../domain/services/AIService';

export class FakeAIService implements AIService {
  private error: Error | null = null;
  private mode: 'immediate' | 'pending' = 'immediate';
  private pendingResolvers: Array<{
    resolve: (tags: string[]) => void;
    reject: (error: Error) => void;
  }> = [];
  public callCount = 0;

  constructor(private tags: string[] = []) {}

  setTags(tags: string[]): void {
    this.mode = 'immediate';
    this.error = null;
    this.tags = tags;
  }

  setError(error: Error): void {
    this.mode = 'immediate';
    this.error = error;
  }

  pending(): void {
    this.mode = 'pending';
  }

  resolvePending(tags: string[]): void {
    const resolvers = this.pendingResolvers;
    this.pendingResolvers = [];
    resolvers.forEach((r) => r.resolve(tags));
  }

  rejectPending(error: Error): void {
    const resolvers = this.pendingResolvers;
    this.pendingResolvers = [];
    resolvers.forEach((r) => r.reject(error));
  }

  async generateTags(
    _content: string,
    signal?: AbortSignal
  ): Promise<string[]> {
    this.callCount += 1;

    if (this.mode === 'immediate') {
      if (this.error) throw this.error;
      return this.tags;
    }

    if (signal?.aborted) {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      throw abortError;
    }

    return new Promise<string[]>((resolve, reject) => {
      this.pendingResolvers.push({ resolve, reject });

      signal?.addEventListener('abort', () => {
        const abortError = new Error('The operation was aborted');
        abortError.name = 'AbortError';
        reject(abortError);
      });
    });
  }
}
