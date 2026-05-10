export type ApiResponse<T> = {
  message: string;
  data?: T;
};

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; response: T }
  | { status: 'error'; error: string };
