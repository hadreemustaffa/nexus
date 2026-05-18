import { Outlet, useLoaderData } from 'react-router';

import type { NoteWithTags } from '../../../features/notes';
import NotesSidebar from '../../../features/notes/components/NotesSidebar';
import styles from './NotesLayout.module.css';

export default function NotesLayout() {
  const data = useLoaderData() as {
    data: NoteWithTags[];
    message: string;
  };

  const notes = data.data;

  return (
    <main className={styles.layout}>
      <NotesSidebar notes={notes} />

      <Outlet />
    </main>
  );
}
