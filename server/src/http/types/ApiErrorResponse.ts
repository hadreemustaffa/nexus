export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
};
