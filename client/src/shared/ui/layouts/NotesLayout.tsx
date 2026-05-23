import { Outlet, useLoaderData } from 'react-router';

import NotesSidebar from '../../../features/notes/components/NotesSidebar';
import styles from './NotesLayout.module.css';

export default function NotesLayout() {
  const { data } = useLoaderData();

  const notes = data.notes;

  return (
    <main className={styles.layout}>
      <NotesSidebar notes={notes} />

      <Outlet />
    </main>
  );
}
