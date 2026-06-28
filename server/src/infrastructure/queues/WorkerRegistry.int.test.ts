import { GenerateTagsJob } from '../../application/jobs/GenerateTagsJob';
import FakeJobProcessor from '../../tests/fakes/JobProcessor.fake';
import WorkerRegistry from './WorkerRegistry';

describe('WorkerRegistry', () => {
  const pollIntervalMs = 1000;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('register returns a dispatcher whose dispatched jobs the underlying worker actually picks up and passes to the processor', async () => {
    const registry = new WorkerRegistry(pollIntervalMs);
    const processor = new FakeJobProcessor<GenerateTagsJob>();

    const dispatcher = registry.register('GENERATE_TAGS', processor);

    const job: GenerateTagsJob = { noteId: 'note-1', content: 'job content' };
    await dispatcher.dispatch(job);

    // worker's first poll already ran synchronously inside register(), found
    // the queue empty, and is now waiting on its pollIntervalMs retry timer —
    // advancing past that is what lets it dequeue the job we just enqueued
    await vi.advanceTimersByTimeAsync(pollIntervalMs);

    expect(processor.process).toHaveBeenCalledWith(job);
    expect(processor.process).toHaveBeenCalledTimes(1);
  });
});
