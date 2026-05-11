import { apiFetch } from '../../../shared/api/client';
import type { ApiResponse } from '../../../shared/types';
import type { NoteWithTags } from '../types';

export const createNote = (data: {
  title: string;
  content: string;
  tags?: string[];
}) =>
  apiFetch<ApiResponse<NoteWithTags>>('/notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getNotes = () => apiFetch<ApiResponse<NoteWithTags[]>>('/notes');

export const getNote = (id: string) =>
  apiFetch<ApiResponse<NoteWithTags>>(`/notes/${id}`);

export const getRelatedNotes = (id: string) =>
  apiFetch<ApiResponse<NoteWithTags[]>>(`/notes/${id}/related`);

export const updateNote = (
  id: string,
  data: { title?: string; content?: string }
) =>
  apiFetch<ApiResponse<NoteWithTags>>(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteNote = (id: string) =>
  apiFetch(`/notes/${id}`, {
    method: 'DELETE',
  });

export const searchNotes = (query: string) =>
  apiFetch<ApiResponse<NoteWithTags[]>>(
    `/notes/search?q=${encodeURIComponent(query)}`
  );
