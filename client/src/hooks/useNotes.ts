import { useEffect, useState } from 'react';
import { getNotes } from '../api/notes.api';
import type { ApiResponse, AsyncState } from '../shared/types';
import type { NoteWithTags } from '../features/note/types';

export function useNotes(): AsyncState<ApiResponse<NoteWithTags[]>> {
  const [state, setState] = useState<AsyncState<ApiResponse<NoteWithTags[]>>>({
    status: 'idle',
  });

  useEffect(() => {
    async function load() {
      setState({ status: 'loading' });

      try {
        const response = await getNotes();

        setState({
          status: 'success',
          response,
        });
      } catch (err) {
        setState({
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    load();
  }, []);

  return state;
}
