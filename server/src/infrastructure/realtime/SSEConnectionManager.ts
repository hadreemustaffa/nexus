import type { Response } from 'express';

export default class SSEConnectionManager {
  private connections: Map<string, Response>;

  constructor() {
    this.connections = new Map();
  }

  public addConnection(noteId: string, response: Response): void {
    this.connections.set(noteId, response);
  }

  removeConnection(noteId: string): void {
    const connection = this.connections.get(noteId);

    if (connection) {
      connection.end();
    }

    this.connections.delete(noteId);
  }

  public getConnection(noteId: string): Response | undefined {
    return this.connections.get(noteId);
  }

  public broadcast(message: string): void {
    for (const response of this.connections.values()) {
      if (!response.socket?.writable) continue;
      const messageBuffer = Buffer.from(`data: ${message}\n\n`);
      response.write(messageBuffer);
    }
  }
}
