import { NavLink } from 'react-router';

import { paths } from '../../../config/paths';
import type { NoteWithTags } from '../types';
import styles from './Note.module.css';

export default function Note({ note }: { note: NoteWithTags }) {
  const formatContent = (content: string) => {
    const maxLength = 40;
    if (content.length > maxLength) {
      return content.slice(0, maxLength).trim() + '...';
    }
    return content;
  };

  return (
    <NavLink
      to={paths.app.notes.note.getHref(note.note.id)}
      className={({ isActive }) =>
        `${isActive ? styles.active : ''} ${styles.note_link}`
      }
    >
      <div className={styles.note}>
        <h2 className={styles.note__title}>{formatContent(note.note.title)}</h2>
      </div>
    </NavLink>
  );
}
