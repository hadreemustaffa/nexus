import { FieldError } from '@nexus/shared';

import { AppError } from './AppError';
import { ExternalServiceError } from './ExternalServiceError';
import { NotFoundError } from './NotFoundError';
import { ValidationError } from './ValidationError';

describe('Errors', () => {
  describe('ExternalServiceError', () => {
    it('initializes with explicit properties and inherit from AppError', () => {
      const message = 'Failed to fetch user data';
      const serviceName = 'GitHub API';

      const error = new ExternalServiceError(message, serviceName);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);

      expect(error.message).toBe(message);
      expect(error.service).toBe(serviceName);
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.statusCode).toBe(502);
    });
  });

  describe('NotFoundError', () => {
    it('initializes with explicit properties and inherit from AppError', () => {
      const error = new NotFoundError('User');

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });

    it('formats the message correctly when only a resource is provided', () => {
      const error = new NotFoundError('Product');

      expect(error.message).toBe('Product not found');
    });

    it('formats the message correctly when both resource and id are provided', () => {
      const error = new NotFoundError('Order', '12345');

      expect(error.message).toBe('Order not found: 12345');
    });
  });

  describe('ValidationError', () => {
    it('initializes with explicit properties and inherit from AppError', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('defaults details to an empty array if not provided', () => {
      const error = new ValidationError('Invalid input');

      expect(error.details).toEqual([]);
    });

    it('stores the provided FieldError array in details', () => {
      const mockDetails: FieldError[] = [
        { field: 'title', message: 'Must provide a title.' },
        { field: 'content', message: 'Content cannot exceed 500 words.' },
      ];

      const error = new ValidationError('Validation failed', mockDetails);

      expect(error.details).toEqual(mockDetails);
      expect(error.details).toHaveLength(2);
    });
  });
});
