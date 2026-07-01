export type ApiResponse<T> = {
  message: string;
  data: T;
};

export type FieldError = { field: string; message: string };

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'INTERNAL_ERROR';

export type ApiErrorResponse = {
  error: {
    code: ErrorCode;
    message: string;
    details?: FieldError[];
  };
};

export type NavigateOptions<T extends string> = {
  path: T;
  params?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | undefined | null>;
};
