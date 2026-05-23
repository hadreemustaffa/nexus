import type { JobMap } from '../../application/jobs/JobMap';
import type JobProcessor from '../../application/jobs/JobProcessor';
import Dispatcher from './Dispatcher';
import InMemoryQueue from './InMemoryQueue';
import type Queue from './Queue';
import Worker from './Worker';

export default class WorkerRegistry {
  private queues: Map<keyof JobMap, Queue<JobMap[keyof JobMap]>>;
  private workers: Worker<JobMap[keyof JobMap]>[];

  constructor() {
    this.queues = new Map();
    this.workers = [];
  }

  register<K extends keyof JobMap>(
    type: K,
    processor: JobProcessor<JobMap[K]>
  ): Dispatcher<K> {
    const queue = new InMemoryQueue<JobMap[K]>();

    const worker = new Worker(queue, processor);

    this.queues.set(type, queue);
    this.workers.push(worker);

    worker.start();

    return new Dispatcher(queue);
  }
}
