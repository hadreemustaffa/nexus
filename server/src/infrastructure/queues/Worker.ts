import type JobProcessor from '../../application/jobs/JobProcessor';
import type Queue from './Queue';

export default class Worker<T> {
  private queue: Queue<T>;
  private processor: JobProcessor<T>;
  private isProcessing: boolean;
  private pollInterval: number;

  constructor(
    queue: Queue<T>,
    processor: JobProcessor<T>,
    pollInterval: number = 5000
  ) {
    this.queue = queue;
    this.processor = processor;
    this.pollInterval = pollInterval;
    this.isProcessing = false;
  }

  start(): void {
    this.processNext();
  }

  private async processNext(): Promise<void> {
    console.log('Worker polling, queue empty:', this.queue.isEmpty());
    if (this.isProcessing) return;

    const job = this.queue.dequeue();

    if (!job) {
      setTimeout(() => this.processNext(), this.pollInterval);
      return;
    }

    this.isProcessing = true;

    try {
      await this.processor.process(job);
    } catch (error) {
      console.error(error);
    } finally {
      this.isProcessing = false;

      setTimeout(() => this.processNext(), 0);
    }
  }
}
