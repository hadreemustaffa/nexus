import { useNotes } from '../../../hooks/useNotes';
import Loader from '../../../shared/ui/loader/Loader';
import Note from './Note';
import styles from './NotesView.module.css';

export default function NotesView() {
  const state = useNotes();

  switch (state.status) {
    case 'loading':
      return <Loader />;

    case 'error':
      return <p className='error'>{state.error}</p>;

    case 'success':
      return (
        <>
          {state.response.data?.length ? (
            <ul className={styles.container}>
              {state.response.data.map((item) => (
                <li key={item.note.id}>
                  <Note note={item.note} />
                </li>
              ))}
            </ul>
          ) : (
            <p>{state.response.message}</p>
          )}
        </>
      );

    default:
      return null;
  }
}
