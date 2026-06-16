import type JobDispatcher from '../../application/jobs/JobDispatcher';
import type JobMap from '../../application/jobs/JobMap';
import type JobProcessor from '../../application/jobs/JobProcessor';
import Dispatcher from './Dispatcher';
import InMemoryQueue from './InMemoryQueue';
import type Queue from './Queue';
import Worker from './Worker';

export default class WorkerRegistry {
  private queues: Map<keyof JobMap, Queue<JobMap[keyof JobMap]>>;
  private workers: Worker<JobMap[keyof JobMap]>[];
  private readonly pollIntervalMs: number;

  constructor(pollIntervalMs: number) {
    this.queues = new Map();
    this.workers = [];
    this.pollIntervalMs = pollIntervalMs;
  }

  register<K extends keyof JobMap>(
    type: K,
    processor: JobProcessor<JobMap[K]>
  ): JobDispatcher<K> {
    const queue = new InMemoryQueue<JobMap[K]>();

    const worker = new Worker(queue, processor, this.pollIntervalMs);

    this.queues.set(type, queue);
    this.workers.push(worker);

    worker.start();

    return new Dispatcher(queue);
  }
}
