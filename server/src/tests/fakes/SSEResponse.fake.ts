import { Response } from 'express';
import { vi } from 'vitest';

export default class FakeSSEResponse {
  write = vi.fn();
  end = vi.fn();
  socket: { writable: boolean } = { writable: true };
  writableEnded = false;

  setSocketWritable(writable: boolean): this {
    this.socket.writable = writable;
    return this;
  }

  setWritableEnded(writableEnded: boolean): this {
    this.writableEnded = writableEnded;
    return this;
  }

  asResponse(): Response {
    return this as unknown as Response;
  }
}
