import type JobCanceller from '../../application/ports/JobCanceller';

export default class FakeJobCanceller implements JobCanceller {
  public cancelledKeys: string[] = [];

  cancel(key: string): void {
    this.cancelledKeys.push(key);
  }

  clear(): void {
    this.cancelledKeys = [];
  }
}
