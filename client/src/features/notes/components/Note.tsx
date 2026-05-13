import type { Note } from '../types';

export default function Note({ note }: { note: Note }) {
  const formatContent = (content: string) => {
    const maxLength = 200;
    if (content.length > maxLength) {
      return content.slice(0, maxLength) + '...';
    }
    return content;
  };

  return (
    <div className='note'>
      <h2>{note.title}</h2>
      <p>{formatContent(note.content)}</p>
    </div>
  );
}
