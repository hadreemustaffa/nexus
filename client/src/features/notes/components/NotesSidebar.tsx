import { Plus } from 'lucide-react';
import { NavLink } from 'react-router';

import { paths } from '../../../config/paths';
import type { NoteWithTags } from '../types';
import Note from './Note';
import styles from './NotesSidebar.module.css';

export default function NotesSidebar({ notes }: { notes: NoteWithTags[] }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__actions}>
        <NavLink to={paths.app.create.path} className={() => `btn`}>
          New <Plus size={16} />
        </NavLink>
      </div>
      <ul>
        {notes
          .sort(
            (a, b) =>
              new Date(b.note.created_at).getTime() -
              new Date(a.note.created_at).getTime()
          )
          .map((note) => (
            <Note key={note.note.id} note={note} />
          ))}
      </ul>
    </aside>
  );
}
