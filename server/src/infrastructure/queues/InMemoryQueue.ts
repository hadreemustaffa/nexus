import type Queue from './Queue';

export default class InMemoryQueue<T> implements Queue<T> {
  private jobs: T[] = [];

  enqueue(job: T): void {
    this.jobs.push(job);
  }

  dequeue(): T | undefined {
    return this.jobs.shift();
  }

  isEmpty(): boolean {
    return this.jobs.length === 0;
  }
}
