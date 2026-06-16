import type { ApiResponse } from '@nexus/shared';
import { Outlet, useLoaderData } from 'react-router';

import NotesSidebar from '../../../features/notes/components/NotesSidebar';
import type { Note } from '../../../features/notes/types';
import styles from './NotesLayout.module.css';

export default function NotesLayout() {
  const { data } = useLoaderData<ApiResponse<{ notes: Note[] }>>();

  const notes = data.notes;

  return (
    <main className={styles.layout}>
      <NotesSidebar notes={notes} />

      <Outlet />
    </main>
  );
}
