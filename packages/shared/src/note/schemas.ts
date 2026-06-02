import { z } from 'zod';

import {
  countWords,
  NOTE_WORD_MAX,
  NOTE_WORD_MIN,
  noteContentMaxWordsMessage,
  noteContentMinWordsMessage,
} from './wordLimits';

export const noteTitleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required');

export const noteContentSchema = z
  .string()
  .min(1, 'Content is required')
  .refine(
    (value) => countWords(value) >= NOTE_WORD_MIN,
    noteContentMinWordsMessage()
  )
  .refine(
    (value) => countWords(value) <= NOTE_WORD_MAX,
    noteContentMaxWordsMessage()
  );

export const createNoteBodySchema = z.object({
  title: noteTitleSchema,
  content: noteContentSchema,
});

export const updateNoteBodySchema = createNoteBodySchema;

export const editNoteFormSchema = createNoteBodySchema.extend({
  id: z.string().min(1, 'Note ID is required'),
});

export const noteIdParamSchema = z.object({
  id: z.string().min(1, 'Note ID is required'),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'query is required'),
});

export type NoteTitle = z.infer<typeof noteTitleSchema>;
export type NoteContent = z.infer<typeof noteContentSchema>;
export type CreateNoteBody = z.infer<typeof createNoteBodySchema>;
export type UpdateNoteBody = z.infer<typeof updateNoteBodySchema>;
export type EditNoteFormValues = z.infer<typeof editNoteFormSchema>;
export type NoteIdParams = z.infer<typeof noteIdParamSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
