import JobProcessor from '../../application/jobs/JobProcessor';

export default class FakeJobProcessor<T> implements JobProcessor<T> {
  process = vi.fn(async () => {});
}
