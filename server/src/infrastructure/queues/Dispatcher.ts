import type { JobMap } from '../../application/jobs/JobMap';
import type Queue from './Queue';

export default class Dispatcher<K extends keyof JobMap> {
  private queue: Queue<JobMap[K]>;

  constructor(queue: Queue<JobMap[K]>) {
    this.queue = queue;
  }

  async dispatch(job: JobMap[K]): Promise<void> {
    this.queue.enqueue(job);
  }
}
