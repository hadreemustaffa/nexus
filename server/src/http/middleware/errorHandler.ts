import { ApiErrorResponse } from '@nexus/shared';
import type { ErrorRequestHandler } from 'express';

import { AppError } from '../../domain/errors/AppError';
import { ValidationError } from '../../domain/errors/ValidationError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const body: ApiErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
    },
  };

  let status = 500;

  if (err instanceof AppError) {
    status = err.statusCode;
    body.error.code = err.code;
    body.error.message = err.message;

    if (err instanceof ValidationError && err.details.length > 0) {
      body.error.details = err.details;
    }

    if (status < 500) {
      console.warn({ code: err.code, message: err.message }, 'Request error');
    } else {
      console.error({ err }, err.message);
    }
  } else {
    console.error({ err }, 'Unexpected error');
  }

  res.status(status).json(body);
};
