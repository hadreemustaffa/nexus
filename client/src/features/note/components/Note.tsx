import type { Note } from '../types';

export default function Note({ note }: { note: Note }) {
  return (
    <div className='note'>
      <h2>{note.title}</h2>
      <p>{note.content}</p>
    </div>
  );
}
