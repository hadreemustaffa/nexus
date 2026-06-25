import JobDispatcher from '../../application/jobs/JobDispatcher';
import JobMap from '../../application/jobs/JobMap';

export class FakeJobDispatcher<
  K extends keyof JobMap,
> implements JobDispatcher<K> {
  public jobs: JobMap[K][] = [];

  async dispatch(job: JobMap[K]): Promise<void> {
    this.jobs.push(job);
  }

  clear(): void {
    this.jobs = [];
  }
}
