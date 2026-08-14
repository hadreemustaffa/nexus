import { isAbortError } from './isAbortError';

describe('isAbortError', () => {
  it('returns true for an Error with name "AbortError"', () => {
    const error = new Error('aborted');
    error.name = 'AbortError';

    expect(isAbortError(error)).toBe(true);
  });

  it('returns true for a DOMException with name "AbortError"', () => {
    expect(isAbortError(new DOMException('aborted', 'AbortError'))).toBe(true);
  });

  it('returns false for a regular Error', () => {
    expect(isAbortError(new Error('some other failure'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isAbortError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isAbortError(undefined)).toBe(false);
  });

  it('returns false for a non-object primitive', () => {
    expect(isAbortError('AbortError')).toBe(false);
  });

  it('returns false for an object with no name property', () => {
    expect(isAbortError({ message: 'oops' })).toBe(false);
  });
});
