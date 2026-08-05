import type JobProcessor from '../../application/jobs/JobProcessor';
import type Logger from '../../application/ports/Logger';
import type Queue from './Queue';

export default class Worker<T> {
  private queue: Queue<T>;
  private processor: JobProcessor<T>;
  private isProcessing: boolean;
  private pollInterval: number;
  private logger: Logger;

  constructor(
    queue: Queue<T>,
    processor: JobProcessor<T>,
    pollInterval: number = 5000,
    logger: Logger
  ) {
    this.queue = queue;
    this.processor = processor;
    this.pollInterval = pollInterval;
    this.isProcessing = false;
    this.logger = logger;
  }

  start(): void {
    void this.processNext();
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing) return;

    const job = this.queue.dequeue();

    if (!job) {
      setTimeout(() => {
        void this.processNext();
      }, this.pollInterval);
      return;
    }

    this.isProcessing = true;

    try {
      await this.processor.process(job);
    } catch (error) {
      this.logger.error({ error: error }, 'Error processing job');
    } finally {
      this.isProcessing = false;

      setTimeout(() => {
        void this.processNext();
      }, 0);
    }
  }
}
