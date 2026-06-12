import { z } from 'zod';

import { countCharacters } from '../utils';
import {
  PROMPT_CHARS_MAX,
  PROMPT_CHARS_MIN,
  promptContentMaxCharactersMessage,
  promptContentMinCharactersMessage,
} from './messages';

export const promptKeySchema = z.string().trim().min(1, 'Key is required');

export const promptContentSchema = z
  .string()
  .min(1, 'Content is required')
  .refine(
    (value) => countCharacters(value) >= PROMPT_CHARS_MIN,
    promptContentMinCharactersMessage()
  )
  .refine(
    (value) => countCharacters(value) <= PROMPT_CHARS_MAX,
    promptContentMaxCharactersMessage()
  );

export const promptVersionSchema = z.number().min(1);

export const createPromptBodySchema = z.object({
  key: promptKeySchema,
  content: promptContentSchema,
});

export const updatePromptBodySchema = createPromptBodySchema;

export const editPromptFormSchema = createPromptBodySchema.extend({
  id: z.string().min(1, 'Prompt ID is required'),
});

export const promptIdParamSchema = z.object({
  id: z.string().min(1, 'Prompt ID is required'),
});

export type PromptContent = z.infer<typeof promptContentSchema>;
export type CreatePromptBody = z.infer<typeof createPromptBodySchema>;
export type UpdatePromptBody = z.infer<typeof updatePromptBodySchema>;
export type EditPromptFormValues = z.infer<typeof editPromptFormSchema>;
export type PromptIdParams = z.infer<typeof promptIdParamSchema>;
