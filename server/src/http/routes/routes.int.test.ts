import http from 'node:http';
import type { AddressInfo } from 'node:net';

import type { Express } from 'express';
import _request from 'supertest';
import TestAgent from 'supertest/lib/agent';

import LinkParsingService from '../../application/services/LinkParsingService';
import { Container } from '../../bootstrap/Container';
import { Env } from '../../config/env';
import InMemoryEventBus from '../../infrastructure/events/InMemoryEventBus';
import SSEConnectionManager from '../../infrastructure/realtime/SSEConnectionManager';
import InMemorySearchService from '../../infrastructure/search/InMemorySearchService';
import { NoteFactory } from '../../tests/factories/Note.factory';
import { PromptFactory } from '../../tests/factories/Prompt.factory';
import { FakeAIService } from '../../tests/fakes/AIService.fake';
import { FakeJobDispatcher } from '../../tests/fakes/JobDispatcher.fake';
import { FakeNoteRepository } from '../../tests/fakes/NoteRepository.fake';
import { FakePromptRepository } from '../../tests/fakes/PromptRepository.fake';
import { FakeTagRepository } from '../../tests/fakes/TagRepository.fake';
import {
  expectError,
  expectSuccess,
} from '../../tests/utils/expectHttpResponse';
import { createApp } from '../app';

const TEST_ENV: Env = {
  NODE_ENV: 'test',
  PORT: 3000,
  CLIENT_URL: 'http://localhost:5173',
  DATABASE_PATH: 'test.db',
  OLLAMA_URL: 'http://localhost:11434',
  OLLAMA_MODEL: 'qwen2.5:7b',
  WORKER_POLL_INTERVAL_MS: 5000,
};

const supertest = _request as unknown as (app: Express) => TestAgent;

describe('routes (integration)', () => {
  let app: Express;
  let noteRepository: FakeNoteRepository;
  let promptRepository: FakePromptRepository;
  let tagsDispatcher: FakeJobDispatcher<'GENERATE_TAGS'>;
  let sseConnectionManager: SSEConnectionManager;
  let requestAgent: TestAgent;

  beforeEach(() => {
    noteRepository = new FakeNoteRepository();
    promptRepository = new FakePromptRepository();
    tagsDispatcher = new FakeJobDispatcher();
    sseConnectionManager = new SSEConnectionManager();

    const container: Container = {
      db: {} as Container['db'],
      noteRepository,
      tagRepository: new FakeTagRepository(),
      promptRepository,
      aiService: new FakeAIService(),
      eventBus: new InMemoryEventBus(),
      sseConnectionManager,
      searchService: new InMemorySearchService(),
      linkParser: new LinkParsingService(noteRepository),
      tagsDispatcher,
    };

    app = createApp({ env: TEST_ENV, container });
    requestAgent = supertest(app);

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('/api/v1/notes', () => {
    // ----- POST /api/v1/notes -----

    describe('POST /api/v1/notes', () => {
      it('returns 201 with the created note', async () => {
        const note = NoteFactory.build();

        const response = await requestAgent
          .post('/api/v1/notes')
          .send({ title: note.getTitle(), content: note.getContent() });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          message: 'Note created successfully.',
          data: {
            note: {
              id: expect.any(String),
              title: note.getTitle(),
              content: note.getContent(),
              created_at: expect.any(String),
              updated_at: expect.any(String),
            },
          },
        });
      });

      it('returns 400 with field details for an invalid body', async () => {
        const response = await requestAgent
          .post('/api/v1/notes')
          .send({ title: '', content: '' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: {
            code: 'VALIDATION_ERROR',
            message: expect.any(String),
            details: expect.arrayContaining([
              expect.objectContaining({ field: 'title' }),
              expect.objectContaining({ field: 'content' }),
            ]),
          },
        });
      });
    });

    // ----- GET /api/v1/notes -----

    describe('GET /api/v1/notes', () => {
      it('returns 200 on success when no notes available', async () => {
        const response = await requestAgent.get('/api/v1/notes');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Success, but no notes found.',
          data: [],
        });
      });

      it('returns 200 with found notes', async () => {
        const note = NoteFactory.build();
        noteRepository.seed([note]);

        const response = await requestAgent.get('/api/v1/notes');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Found notes.',
          data: {
            notes: [
              expect.objectContaining({
                id: note.getId(),
                title: note.getTitle(),
              }),
            ],
          },
        });
      });
    });

    // ----- GET /api/v1/notes/search -----

    describe('GET /api/v1/notes/search', () => {
      it('returns 200 with search results', async () => {
        const response = await requestAgent
          .get('/api/v1/notes/search')
          .query({ q: 'test' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Search found some notes.',
          data: [],
        });
      });

      it('returns 400 for a missing query param', async () => {
        const response = await requestAgent.get('/api/v1/notes/search');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: {
            code: 'VALIDATION_ERROR',
            message: expect.any(String),
            details: expect.arrayContaining([
              expect.objectContaining({ field: 'q' }),
            ]),
          },
        });
      });
    });

    // ----- GET /api/v1/notes/:id -----

    describe('GET /api/v1/notes/:id', () => {
      it('returns 200 with the note and its tags', async () => {
        const note = NoteFactory.build();
        noteRepository.seed([note]);

        const response = await requestAgent.get(
          `/api/v1/notes/${note.getId()}`
        );

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Note found.',
          data: {
            note: expect.objectContaining({ id: note.getId() }),
            tags: [],
          },
        });
      });

      it('returns 404 for missing note', async () => {
        const response = await requestAgent.get(
          `/api/v1/notes/missing-note-id`
        );

        const responseBody = expectError(response);

        expect(response.status).toBe(404);
        expect(responseBody.error.code).toBe('NOT_FOUND');
      });
    });

    // ----- GET /api/v1/notes/:id/related -----

    describe('GET /api/v1/notes/:id/related', () => {
      it('returns 200 with related notes', async () => {
        const noteA = NoteFactory.build();
        const noteB = NoteFactory.build();
        noteRepository.seed([noteA, noteB]);

        await noteRepository.saveLink(noteA.getId(), noteB.getId());

        const response = await requestAgent.get(
          `/api/v1/notes/${noteA.getId()}/related`
        );

        const responseBody = expectSuccess(response);

        expect(response.status).toBe(200);
        expect(responseBody.message).toBe('Found related notes.');
        expect(responseBody.data).toEqual([
          {
            id: noteB.getId(),
            title: noteB.getTitle(),
            content: noteB.getContent(),
            created_at: noteB.getCreatedAt().toISOString(),
            updated_at: noteB.getUpdatedAt().toISOString(),
          },
        ]);
      });

      it('returns 200 on success when no related notes available', async () => {
        const noteA = NoteFactory.build();
        noteRepository.seed([noteA]);

        const response = await requestAgent.get(
          `/api/v1/notes/${noteA.getId()}/related`
        );

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Success, but no notes found.',
          data: [],
        });
      });

      it('returns 404 for missing note', async () => {
        const response = await requestAgent.get(
          `/api/v1/notes/missing-note-id/related`
        );

        const responseBody = expectError(response);

        expect(response.status).toBe(404);
        expect(responseBody.error.code).toBe('NOT_FOUND');
      });
    });

    // ----- PUT /api/v1/notes/:id -----

    describe('PUT /api/v1/notes/:id', () => {
      it('returns 200 with the updated note', async () => {
        const note = NoteFactory.build();
        noteRepository.seed([note]);

        const response = await requestAgent
          .put(`/api/v1/notes/${note.getId()}`)
          .send({ title: 'Updated Title', content: note.getContent() });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Note updated succesfully.',
          data: {
            note: expect.objectContaining({
              id: note.getId(),
              title: 'Updated Title',
            }),
          },
        });
      });

      it('returns 400 for an invalid body', async () => {
        const note = NoteFactory.build();
        noteRepository.seed([note]);

        const response = await requestAgent
          .put(`/api/v1/notes/${note.getId()}`)
          .send({ title: '', content: '' });

        const responseBody = expectError(response);

        expect(response.status).toBe(400);
        expect(responseBody.error.code).toBe('VALIDATION_ERROR');
      });
    });

    // ----- DELETE /api/v1/notes/:id -----

    describe('DELETE /api/v1/notes/:id', () => {
      it('returns 200 and removes the note', async () => {
        const note = NoteFactory.build();
        noteRepository.seed([note]);

        const response = await requestAgent.delete(
          `/api/v1/notes/${note.getId()}`
        );

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Note deleted successfully.',
        });
        expect(await noteRepository.findById(note.getId())).toBeNull();
      });

      it('returns 404 when deleting missing note', async () => {
        const response = await requestAgent.delete(
          `/api/v1/notes/missing-note-id}`
        );

        const responseBody = expectError(response);

        expect(response.status).toBe(404);
        expect(responseBody.error.code).toBe('NOT_FOUND');
      });
    });

    // ----- POST /api/v1/notes/:id/tags -----

    describe('POST /api/v1/notes/:id/tags', () => {
      it('returns 200 and dispatches a tag generation job', async () => {
        const note = NoteFactory.build();
        noteRepository.seed([note]);

        const response = await requestAgent.post(
          `/api/v1/notes/${note.getId()}/tags`
        );

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Tag regeneration started.' });
        expect(tagsDispatcher.jobs).toContainEqual({
          noteId: note.getId(),
          content: note.getContent(),
        });
      });
    });

    // ----- GET /api/v1/notes/:id/events (SSE) -----
    //
    // supertest buffers a full response before resolving, making it unsuitable for
    // long-lived SSE connections. Instead, we spin up a real server on a random
    // port, make a raw http request, assert headers and connection state while the
    // stream is open, then destroy the socket and wait a tick for the server-side
    // 'close' handler to fire before asserting removal.

    describe('GET /api/v1/notes/:id/events', () => {
      it('sets SSE headers and registers/removes the connection on close', async () => {
        const noteId = 'test-note-id';
        const addSpy = vi.spyOn(sseConnectionManager, 'addConnection');
        const removeSpy = vi.spyOn(sseConnectionManager, 'removeConnection');

        await new Promise<void>((resolve, reject) => {
          const rejectWithError = (error: unknown) =>
            reject(error instanceof Error ? error : new Error(String(error)));

          const server = app.listen(0, () => {
            const { port } = server.address() as AddressInfo;

            const req = http.get(
              `http://localhost:${port}/api/v1/notes/${noteId}/events`,
              (res) => {
                expect(res.headers['content-type']).toBe('text/event-stream');
                expect(res.headers['cache-control']).toBe('no-cache');
                expect(res.headers['connection']).toBe('keep-alive');
                expect(addSpy).toHaveBeenCalledWith(noteId, expect.anything());

                req.destroy();

                // give the server's req.on('close') handler a tick to run
                setTimeout(() => {
                  try {
                    expect(removeSpy).toHaveBeenCalledWith(noteId);
                    server.close((err) =>
                      err ? rejectWithError(err) : resolve()
                    );
                  } catch (err) {
                    server.close(() => rejectWithError(err));
                  }
                }, 50);
              }
            );

            req.on('error', (err) => {
              // ECONNRESET is expected when req.destroy() races with the response
              if ((err as NodeJS.ErrnoException).code !== 'ECONNRESET') {
                server.close(() => rejectWithError(err));
              }
            });
          });
        });
      });
    });
  });

  describe('/api/v1/prompts', () => {
    // ----- GET /api/v1/prompts -----

    describe('GET /api/v1/prompts', () => {
      it('returns 200 on success when no prompts available', async () => {
        const response = await requestAgent.get('/api/v1/prompts');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Success, but no prompts found.',
          data: [],
        });
      });

      it('returns 200 with found prompts', async () => {
        const prompt = PromptFactory.build();
        promptRepository.prompts.set(prompt.id, prompt);

        const response = await requestAgent.get('/api/v1/prompts');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Prompts found.',
          data: {
            prompts: [
              expect.objectContaining({ id: prompt.id, key: prompt.key }),
            ],
          },
        });
      });
    });

    // ----- POST /api/v1/prompts/create -----

    describe('POST /api/v1/prompts/create', () => {
      it('returns 201 with the created prompt', async () => {
        const prompt = PromptFactory.build();

        const response = await requestAgent
          .post('/api/v1/prompts/create')
          .send({ key: prompt.key, content: prompt.content });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          message: 'Prompt created successfully',
          data: expect.objectContaining({
            key: prompt.key,
            content: prompt.content,
          }),
        });
      });

      it('returns 400 with field details for an invalid body', async () => {
        const response = await requestAgent
          .post('/api/v1/prompts/create')
          .send({ key: '', content: '' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: {
            code: 'VALIDATION_ERROR',
            message: expect.any(String),
            details: expect.arrayContaining([
              expect.objectContaining({ field: 'key' }),
              expect.objectContaining({ field: 'content' }),
            ]),
          },
        });
      });
    });
  });

  describe('unknown routes', () => {
    it('returns 404/NOT_FOUND for an unmatched route', async () => {
      const response = await requestAgent.get('/api/v1/does-not-exist');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: { code: 'NOT_FOUND', message: 'Route not found' },
      });
    });
  });
});
