import { type FieldError } from '@nexus/shared';

import { AppError } from './AppError';

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR' as const;
  readonly statusCode = 400;
  readonly details: FieldError[];

  constructor(message: string, details: FieldError[] = []) {
    super(message);
    this.details = details;
  }
}
