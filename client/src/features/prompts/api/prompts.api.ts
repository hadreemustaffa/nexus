import type { ApiResponse } from '@nexus/shared';
import { api } from '@nexus/shared';

import { apiFetch } from '../../../shared/api/client';
import type { Prompt } from '../types';

export const createPrompt = (data: { key: string; content: string }) =>
  apiFetch<ApiResponse<Prompt>>(api.prompts.create.getRoute(), {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getAllPrompts = () =>
  apiFetch<ApiResponse<Prompt[]>>(api.prompts.root.getRoute());
