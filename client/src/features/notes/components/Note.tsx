import { NavLink } from 'react-router';

import { paths } from '../../../config/paths';
import { shortenStr } from '../../../shared/utils/shortenStr';
import type { Note } from '../types';
import styles from './Note.module.css';

export default function Note({ note }: { note: Note }) {
  const maxLengthChars = 40;

  return (
    <NavLink
      to={paths.app.notes.note.getHref(note.id)}
      className={({ isActive }) =>
        `${isActive ? styles.active : ''} ${styles.note_link}`
      }
    >
      <div className={styles.note}>
        <h2 className={styles.note__title}>
          {shortenStr(note.title, maxLengthChars)}
        </h2>
      </div>
    </NavLink>
  );
}
