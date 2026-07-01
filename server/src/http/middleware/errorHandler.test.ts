import type { NextFunction, Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ExternalServiceError } from '../../domain/errors/ExternalServiceError';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { ValidationError } from '../../domain/errors/ValidationError';
import { errorHandler } from './errorHandler';

describe('errorHandler', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as Request;
    res = {
      headersSent: false,
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    next = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['NotFoundError', new NotFoundError('Note', '123'), 404, 'NOT_FOUND'],
    [
      'ExternalServiceError',
      new ExternalServiceError(
        'AI service unavailable',
        'TagGenerationService'
      ),
      502,
      'EXTERNAL_SERVICE_ERROR',
    ],
    [
      'ValidationError',
      new ValidationError('Invalid request'),
      400,
      'VALIDATION_ERROR',
    ],
  ])(
    'maps %s to its statusCode/code/message',
    (_label, error, statusCode, code) => {
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith({
        error: { code, message: error.message },
      });
    }
  );

  it('includes details only for a ValidationError with a non-empty details array', () => {
    const details = [{ field: 'title', message: 'Required' }];
    const error = new ValidationError('Invalid request', details);

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details },
    });
  });

  it('omits details for a ValidationError with an empty details array', () => {
    const error = new ValidationError('Invalid request', []);

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid request' },
    });
  });

  it('falls back to 500/INTERNAL_ERROR for a non-AppError', () => {
    const error = new Error('unexpected failure');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
    });
  });

  it('calls next(err) without writing a response if headers were already sent', () => {
    const sentRes = {
      headersSent: true,
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const error = new NotFoundError('Note', '123');

    errorHandler(error, req, sentRes, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(sentRes.status).not.toHaveBeenCalled();
    expect(sentRes.json).not.toHaveBeenCalled();
  });
});
