import JobMap from './JobMap';

type CancellableJobType = keyof Pick<JobMap, 'GENERATE_TAGS'>;

export function buildJobCancellationKey(
  jobType: CancellableJobType,
  entityId: string
): string {
  return `${jobType}:${entityId}`;
}
