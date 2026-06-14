import type { ApiErrorResponse, ApiResponse } from '@nexus/shared';

export class ApiError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly message: string;
  readonly details?: { field: string; message: string }[];

  constructor(
    code: string,
    statusCode: number,
    message: string,
    details?: { field: string; message: string }[]
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  let body: unknown = null;

  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    /* empty */
  }

  if (!res.ok) {
    if (body === null) {
      throw new ApiError('INTERNAL_ERROR', res.status, 'Request failed');
    }

    const errorBody = body as ApiErrorResponse;
    throw new ApiError(
      errorBody.error.code,
      res.status,
      errorBody.error.message,
      errorBody.error.details
    );
  }

  return body as T;
}
