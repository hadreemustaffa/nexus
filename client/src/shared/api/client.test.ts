import { http, HttpResponse } from 'msw';

import { server } from '../../tests/mocks/server';
import { ApiError, apiFetch } from './client';

describe('apiFetch', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns parsed JSON on a successful response', async () => {
    server.use(
      http.get('http://localhost:3000/notes', () => {
        return HttpResponse.json({ message: 'ok', data: { foo: 'bar' } });
      })
    );

    const result = await apiFetch('/notes');

    expect(result).toEqual({ message: 'ok', data: { foo: 'bar' } });
  });

  it('throws an ApiError populated from the response body on a non-OK response', async () => {
    server.use(
      http.get('http://localhost:3000/notes', () => {
        return HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Note not found' } },
          { status: 404 }
        );
      })
    );

    let thrownError: unknown;

    try {
      await apiFetch('/notes');
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(ApiError);
    expect((thrownError as ApiError).code).toBe('NOT_FOUND');
    expect((thrownError as ApiError).statusCode).toBe(404);
    expect((thrownError as ApiError).message).toBe('Note not found');
  });

  it('throws Internal Error when response is not valid JSON', async () => {
    server.use(
      http.get('http://localhost:3000/notes', () => {
        return HttpResponse.text('not json', { status: 500 });
      })
    );

    let thrownError: unknown;

    try {
      await apiFetch('/notes');
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(ApiError);
    expect((thrownError as ApiError).code).toBe('INTERNAL_ERROR');
    expect((thrownError as ApiError).statusCode).toBe(500);
    expect((thrownError as ApiError).message).toBe('Request failed');
  });

  it('sends correct content type merged with caller options, against full API path`', async () => {
    let capturedRequest: Request | undefined;

    server.use(
      http.get('http://localhost:3000/notes', ({ request }) => {
        capturedRequest = request;
        return HttpResponse.json({ message: 'ok', data: null });
      })
    );

    await apiFetch('/notes', {
      headers: { 'X-Custom-Header': 'test-value' },
    });

    expect(capturedRequest?.url).toBe('http://localhost:3000/notes');
    expect(capturedRequest?.headers.get('Content-Type')).toBe(
      'application/json'
    );
    expect(capturedRequest?.headers.get('X-Custom-Header')).toBe('test-value');
  });
});
