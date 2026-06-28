import FakeSSEResponse from '../../tests/fakes/SSEResponse.fake';
import SSEConnectionManager from './SSEConnectionManager';

describe('SSEConnectionManager', () => {
  let sseConnectionManager: SSEConnectionManager;

  beforeEach(() => {
    sseConnectionManager = new SSEConnectionManager();
  });

  it('addConnection + getConnection round-trip by noteId', () => {
    const response = new FakeSSEResponse().asResponse();

    sseConnectionManager.addConnection('note-1', response);

    expect(sseConnectionManager.getConnection('note-1')).toBe(response);
  });

  it('removeConnection ends the response and removes it from the map', () => {
    const response = new FakeSSEResponse();

    sseConnectionManager.addConnection('note-1', response.asResponse());
    sseConnectionManager.removeConnection('note-1');

    expect(response.end).toHaveBeenCalledTimes(1);
    expect(sseConnectionManager.getConnection('note-1')).toBeUndefined();
  });

  it('broadcast writes to every connection with a writable socket', () => {
    const responseA = new FakeSSEResponse();
    const responseB = new FakeSSEResponse();

    sseConnectionManager.addConnection('note-1', responseA.asResponse());
    sseConnectionManager.addConnection('note-2', responseB.asResponse());

    sseConnectionManager.broadcast('hello');

    const expectedBuffer = Buffer.from('data: hello\n\n');
    expect(responseA.write).toHaveBeenCalledWith(expectedBuffer);
    expect(responseB.write).toHaveBeenCalledWith(expectedBuffer);
  });

  it('broadcast skips connections with a non-writable socket', () => {
    const writableResponse = new FakeSSEResponse();
    const nonWritableResponse = new FakeSSEResponse().setSocketWritable(false);

    sseConnectionManager.addConnection('note-1', writableResponse.asResponse());
    sseConnectionManager.addConnection(
      'note-2',
      nonWritableResponse.asResponse()
    );

    sseConnectionManager.broadcast('hello');

    expect(writableResponse.write).toHaveBeenCalledTimes(1);
    expect(nonWritableResponse.write).not.toHaveBeenCalled();
  });
});
