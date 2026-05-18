import { NavLink, useLoaderData } from 'react-router';

import type { Note, NoteWithTags } from '../types';
import styles from './NoteDetail.module.css';

type Response<T> = {
  message: string;
  data: T;
};

export default function NoteDetail() {
  const { note, related } = useLoaderData() as {
    note: Response<NoteWithTags>;
    related: Response<Note[]>;
  };

  const noteData = note.data;
  const relatedData = related.data;

  return (
    <div className={styles.content}>
      <h2>{noteData.note.title}</h2>

      <p>{noteData.note.content}</p>

      {relatedData.length > 0 && (
        <div className={styles.related}>
          <p>Related Notes</p>
          <ul>
            {relatedData.map((note) => (
              <li key={note.id}>
                <NavLink to={`/notes/${note.id}`}>{note.title}</NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
