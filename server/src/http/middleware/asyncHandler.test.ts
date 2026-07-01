import { NextFunction, Request, Response } from 'express';

import { asyncHandler } from './asyncHandler';

describe('asyncHandler', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.useFakeTimers();

    req = {} as Request;
    res = {} as Response;
    next = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves a successful async handler normally (does not call next)', async () => {
    const handler = vi.fn(async () => {
      /* no-op success */
    });

    asyncHandler(handler)(req, res, next);
    await vi.advanceTimersByTimeAsync(0);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards a thrown/rejected error to next()', async () => {
    const error = new Error('failed');
    const handler = vi.fn(async () => {
      throw error;
    });

    asyncHandler(handler)(req, res, next);
    await vi.advanceTimersByTimeAsync(0);

    expect(next).toHaveBeenCalledWith(error);
  });
});
