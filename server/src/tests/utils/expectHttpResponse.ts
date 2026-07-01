import { ApiErrorResponse, ApiResponse } from '@nexus/shared';
import TestAgent from 'supertest/lib/agent';

type SupertestResponse = Awaited<ReturnType<TestAgent['get']>>;

export function expectError(response: SupertestResponse): ApiErrorResponse {
  return response.body as ApiErrorResponse;
}

export function expectSuccess<T>(response: SupertestResponse): ApiResponse<T> {
  return response.body as ApiResponse<T>;
}
