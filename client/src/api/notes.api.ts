import type { ApiResponse } from '../shared/types';
import type { NoteWithTags } from '../features/note/types';
import { apiFetch } from './client';

export const getNotes = () => apiFetch<ApiResponse<NoteWithTags[]>>('/notes');
