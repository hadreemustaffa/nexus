import type { RequestHandler } from 'express';
import { type z, ZodError } from 'zod';

import { ValidationError } from '../../domain/errors/ValidationError';

type ValidateSchemas = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

function toValidationError(error: ZodError): ValidationError {
  const details = error.issues.map((issue) => ({
    field: issue.path.map(String).join('.') || 'request',
    message: issue.message,
  }));

  return new ValidationError('Invalid request', details);
}

export function validate(schemas: ValidateSchemas): RequestHandler {
  return (req, _res, next) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(toValidationError(error));
        return;
      }
      next(error);
    }
  };
}
