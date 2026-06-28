import FakeJobProcessor from '../../tests/fakes/JobProcessor.fake';
import FakeQueue from '../../tests/fakes/Queue.fake';
import Worker from './Worker';

describe('Worker', () => {
  let queue: FakeQueue<{ id: string }>;
  let processor: FakeJobProcessor<{ id: string }>;

  beforeEach(() => {
    vi.useFakeTimers();
    queue = new FakeQueue<{ id: string }>();
    processor = new FakeJobProcessor<{ id: string }>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('processes an already-queued job immediately on start()', async () => {
    const job = { id: 'job-1' };
    queue.dequeue.mockReturnValueOnce(job);

    const worker = new Worker(queue, processor, 5000);
    worker.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(processor.process).toHaveBeenCalledWith(job);
    expect(processor.process).toHaveBeenCalledTimes(1);
  });

  it('does not call process and schedules a retry after pollInterval when the queue is empty', async () => {
    queue.dequeue.mockReturnValue(undefined);
    const pollInterval = 1000;

    const worker = new Worker(queue, processor, pollInterval);
    worker.start();

    await vi.advanceTimersByTimeAsync(0);
    expect(processor.process).not.toHaveBeenCalled();
    expect(queue.dequeue).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(pollInterval);
    expect(queue.dequeue).toHaveBeenCalledTimes(2);
    expect(processor.process).not.toHaveBeenCalled();
  });

  it('catches an error thrown by processor.process instead of crashing, and keeps polling', async () => {
    const job = { id: 'job-1' };
    queue.dequeue.mockReturnValueOnce(job); // subsequent calls return undefined
    processor.process.mockRejectedValueOnce(new Error('process failed'));
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const worker = new Worker(queue, processor, 5000);
    worker.start();

    // finally-block has a 0ms reschedule that fires inside the same window, so
    // flush twice to be safe regardless of whether it cascades in one pass
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(0);

    expect(processor.process).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(queue.dequeue).toHaveBeenCalledTimes(2); // failed job + the retry that followed

    consoleErrorSpy.mockRestore();
  });

  it('does not start a second concurrent processNext while one is still running', async () => {
    const jobA = { id: 'job-a' };
    queue.dequeue.mockReturnValueOnce(jobA);

    let resolveProcess!: () => void;
    processor.process.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveProcess = resolve;
      })
    );

    const worker = new Worker(queue, processor, 5000);

    worker.start();
    worker.start(); // subsequent call while the first job is still in-flight

    expect(queue.dequeue).toHaveBeenCalledTimes(1);
    expect(processor.process).toHaveBeenCalledTimes(1);

    // let the in-flight job settle so its scheduled timer does not leak into the next test
    resolveProcess();
    await vi.advanceTimersByTimeAsync(0);
  });
});
