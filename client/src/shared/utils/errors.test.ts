import { ApiError } from '../api/client';
import { handleActionError, handleLoaderError } from './errors';

describe('errors', () => {
  describe('handleActionError', () => {
    it('returns an error object with the provided message when the error is an ApiError', () => {
      const apiError = new ApiError('NOT_FOUND', 404, 'Resource not found');
      const message = 'An error occurred while performing the action.';

      const result = handleActionError(apiError, message);

      expect(result).toEqual({ error: message });
    });

    it('throws the original error when it is not an ApiError', () => {
      const genericError = new Error('Some generic error');
      const message = 'An error occurred while performing the action.';

      expect(() => handleActionError(genericError, message)).toThrow(
        genericError
      );
    });
  });

  describe('handleLoaderError', () => {
    it('throws a Response with the provided message and status code when the error is an ApiError', () => {
      const apiError = new ApiError('NOT_FOUND', 404, 'Resource not found');
      const message = 'An error occurred while loading the data.';

      expect(() => handleLoaderError(apiError, message)).toThrow(
        new Response(message, { status: apiError.statusCode })
      );
    });

    it('throws the original error when it is not an ApiError', () => {
      const genericError = new Error('Some generic error');
      const message = 'An error occurred while loading the data.';

      expect(() => handleLoaderError(genericError, message)).toThrow(
        genericError
      );
    });
  });
});
