import { Plus } from 'lucide-react';
import { NavLink } from 'react-router';

import { paths } from '../../../config/paths';
import type { Note as NoteType } from '../types';
import Note from './Note';
import styles from './NotesSidebar.module.css';

export default function NotesSidebar({ notes }: { notes: NoteType[] }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__actions}>
        <NavLink
          to={paths.app.notes.create.getHref()}
          className={`btn  ${styles.btn_new}`}
        >
          New <Plus size={16} />
        </NavLink>
      </div>
      {notes && notes.length > 0 ? (
        <ul>
          {notes
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .map((note) => (
              <Note key={note.id} note={note} />
            ))}
        </ul>
      ) : (
        <p className={styles.sidebar__empty}>
          Nothing here yet — start by creating a note.
        </p>
      )}
    </aside>
  );
}
