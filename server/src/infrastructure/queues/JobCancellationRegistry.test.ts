import JobCancellationRegistry from './JobCancellationRegistry';

describe('JobCancellationRegistry', () => {
  let registry: JobCancellationRegistry;

  beforeEach(() => {
    registry = new JobCancellationRegistry();
  });

  describe('begin', () => {
    it('returns a fresh, non-aborted AbortController', () => {
      const controller = registry.begin('note-1');

      expect(controller).toBeInstanceOf(AbortController);
      expect(controller.signal.aborted).toBe(false);
    });
  });

  describe('cancel', () => {
    it('aborts the controller registered for that key', () => {
      const controller = registry.begin('note-1');

      registry.cancel('note-1');

      expect(controller.signal.aborted).toBe(true);
    });

    it('is a no-op when nothing is registered for that key', () => {
      expect(() => registry.cancel('missing-key')).not.toThrow();
    });

    it('does not affect a different key', () => {
      const controllerA = registry.begin('note-1');
      const controllerB = registry.begin('note-2');

      registry.cancel('note-1');

      expect(controllerA.signal.aborted).toBe(true);
      expect(controllerB.signal.aborted).toBe(false);
    });
  });

  describe('end', () => {
    it('removes the entry so a later cancel is a no-op', () => {
      const controller = registry.begin('note-1');

      registry.end('note-1');
      registry.cancel('note-1');

      expect(controller.signal.aborted).toBe(false);
    });
  });

  describe('begin called twice with the same key', () => {
    it('overwrites the entry: cancel only aborts the second controller, the first is orphaned', () => {
      const first = registry.begin('note-1');
      const second = registry.begin('note-1');

      registry.cancel('note-1');

      expect(first.signal.aborted).toBe(false);
      expect(second.signal.aborted).toBe(true);
    });
  });
});
