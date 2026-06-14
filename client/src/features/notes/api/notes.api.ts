import { api, type ApiResponse } from '@nexus/shared';

import { apiFetch } from '../../../shared/api/client';
import type { NoteWithTags } from '../types';

export const createNote = (data: {
  title: string;
  content: string;
  tags?: string[];
}) =>
  apiFetch<ApiResponse<NoteWithTags>>(api.notes.root.getRoute(), {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getNotes = () =>
  apiFetch<ApiResponse<NoteWithTags[]>>(api.notes.root.getRoute());

export const getNote = (id: string) =>
  apiFetch<ApiResponse<NoteWithTags>>(api.notes.byId.getRoute(id));

export const getRelatedNotes = (id: string) =>
  apiFetch<ApiResponse<NoteWithTags[]>>(api.notes.related.getRoute(id));

export const updateNote = (
  id: string,
  data: { title?: string; content?: string }
) =>
  apiFetch<ApiResponse<NoteWithTags>>(api.notes.byId.getRoute(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteNote = (id: string) =>
  apiFetch(api.notes.byId.getRoute(id), {
    method: 'DELETE',
  });

export const searchNotes = (query: string) =>
  apiFetch<ApiResponse<NoteWithTags[]>>(
    api.notes.search.getRoute(encodeURIComponent(query))
  );

export const regenerateNoteTags = (id: string) =>
  apiFetch<ApiResponse<NoteWithTags>>(api.notes.tags.getRoute(id), {
    method: 'POST',
  });
