export type ApiResponse<T> = {
  message: string;
  data: T;
};

export type FieldError = { field: string; message: string };

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: FieldError[];
  };
};
