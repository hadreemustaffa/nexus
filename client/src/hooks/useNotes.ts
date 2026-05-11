import { useEffect, useState } from 'react';

import type { NoteWithTags } from '../features/notes';
import { getNotes } from '../features/notes/api/notes.api';
import type { ApiResponse, AsyncState } from '../shared';
import { ERRORS } from '../shared';

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
        let errorMessage = ERRORS.API.SERVER_ERROR;

        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          errorMessage = ERRORS.API.NETWORK_ERROR;
        } else if (err instanceof Error && err.message.includes('404')) {
          errorMessage = ERRORS.API.NOT_FOUND;
        }

        setState({
          status: 'error',
          error: errorMessage,
        });
      }
    }

    load();
  }, []);

  return state;
}
