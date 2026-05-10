import Loader from '../../../components/Loader';
import { useNotes } from '../../../hooks/useNotes';
import Note from './Note';

export default function ShowAllNotes() {
  const state = useNotes();

  switch (state.status) {
    case 'loading':
      return (
        <main className='center'>
          <Loader />
        </main>
      );

    case 'error':
      return <p>Error: {state.error}</p>;

    case 'success':
      return (
        <>
          {state.response.data?.length ? (
            <ul className='container notes'>
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
