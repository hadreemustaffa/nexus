import type JobMap from './JobMap';

export default interface JobDispatcher<K extends keyof JobMap> {
  dispatch(job: JobMap[K]): Promise<void>;
}
