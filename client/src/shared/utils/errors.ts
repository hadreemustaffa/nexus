import { ApiError } from '../api/client';

export const ERRORS = {
  SERVER_ERROR:
    'An error occurred while fetching data. Please try again later.',
  NETWORK_ERROR:
    "We couldn't connect to the server. Please check your network and try again.",
  API: {
    NOT_FOUND: 'The requested resource was not found.',
  },
};

export function handleActionError(error: unknown, message: string) {
  if (error instanceof ApiError) {
    return { error: message };
  }
  throw error;
}

export function handleLoaderError(error: unknown, message: string): never {
  if (error instanceof ApiError) {
    throw new Response(message, { status: error.statusCode });
  }
  throw error;
}
