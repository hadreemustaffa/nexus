import type { Response } from 'express';
import { vi } from 'vitest';

import type SSEConnectionManager from '../../infrastructure/realtime/SSEConnectionManager';

export default class FakeSSEConnectionManager {
  addConnection = vi.fn();
  removeConnection = vi.fn();
  getConnection = vi.fn();
  broadcast = vi.fn();

  setConnection(noteId: string, response: Response): this {
    this.getConnection.mockImplementation((id: string) =>
      id === noteId ? response : undefined
    );
    return this;
  }

  asConnectionManager(): SSEConnectionManager {
    return this as unknown as SSEConnectionManager;
  }
}
