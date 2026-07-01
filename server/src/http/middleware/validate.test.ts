import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { ValidationError } from '../../domain/errors/ValidationError';
import { validate } from './validate';

describe('validate', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} } as Request;
    res = { locals: {} } as Response;
    next = vi.fn();
  });

  it('parses and replaces req.params/req.body on success', () => {
    const paramsSchema = z.object({ id: z.coerce.number() });
    const bodySchema = z.object({ title: z.string() });

    req.params = { id: '42' };
    req.body = { title: 'hello' };

    validate({ params: paramsSchema, body: bodySchema })(req, res, next);

    expect(req.params).toEqual({ id: 42 });
    expect(req.body).toEqual({ title: 'hello' });
    expect(next).toHaveBeenCalledWith();
  });

  it('stores the parsed query on res.locals.query (since req.query is read-only)', () => {
    const querySchema = z.object({ page: z.coerce.number() });
    req.query = { page: '2' };

    validate({ query: querySchema })(req, res, next);

    expect(res.locals.query).toEqual({ page: 2 });
    expect(next).toHaveBeenCalledWith();
  });

  it('converts a ZodError into a ValidationError with field-mapped details', () => {
    const bodySchema = z.object({ title: z.string() });
    req.body = { title: 42 };

    validate({ body: bodySchema })(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    const errorArg: unknown = (next as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0];

    if (!(errorArg instanceof ValidationError)) {
      throw new Error(`Expected ValidationError, got ${String(errorArg)}`);
    }

    expect(errorArg.details).toEqual([
      { field: 'title', message: expect.any(String) },
    ]);
  });

  it('passes a non-Zod error straight to next() unchanged', () => {
    const error = new Error('failed');
    const throwingSchema = {
      parse: vi.fn(() => {
        throw error;
      }),
    } as unknown as z.ZodType;

    validate({ body: throwingSchema })(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
