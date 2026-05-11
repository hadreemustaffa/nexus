import type { ApiResponse } from '../types';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
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
    body = await res.json();
  } catch {
    /* empty */
  }

  if (!res.ok) {
    const body = (await res.json()) as ApiResponse<T>;
    throw new ApiError(body?.message ?? 'Request failed', res.status);
  }

  return body as T;
}
