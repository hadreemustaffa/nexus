import { GenerateTagsJob } from '../../application/jobs/GenerateTagsJob';
import FakeQueue from '../../tests/fakes/Queue.fake';
import Dispatcher from './Dispatcher';

describe('Dispatcher', () => {
  it('enqueues the job onto the given queue', async () => {
    const queue = new FakeQueue<GenerateTagsJob>();
    const dispatcher = new Dispatcher(queue);

    const job: GenerateTagsJob = { noteId: 'note-1', content: 'job content' };

    await dispatcher.dispatch(job);

    expect(queue.enqueue).toHaveBeenCalledWith(job);
    expect(queue.enqueue).toHaveBeenCalledTimes(1);
  });
});
