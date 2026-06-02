import { AppError } from './AppError';

export class ExternalServiceError extends AppError {
  readonly code = 'EXTERNAL_SERVICE_ERROR' as const;
  readonly statusCode = 502;
  readonly service: string;

  constructor(message: string, service: string) {
    super(message);
    this.service = service;
  }
}
