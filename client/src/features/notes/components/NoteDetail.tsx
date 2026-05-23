import { Edit, EllipsisVertical, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  NavLink,
  useLoaderData,
  useNavigate,
  useRevalidator,
} from 'react-router';

import { paths } from '../../../config/paths';
import Button from '../../../shared/ui/button/Button';
import Tag from '../../tags/Tag';
import { deleteNote } from '../api/notes.api';
import type { Note, NoteWithTags, Response, Tag as TagType } from '../types';
import styles from './NoteDetail.module.css';

export default function NoteDetail() {
  const { note, related } = useLoaderData() as {
    note: Response<NoteWithTags>;
    related: Response<Note[]>;
  };

  const noteData = note.data;
  const relatedData = related.data;

  const [tags, setTags] = useState<TagType[]>(noteData.tags ?? []);

  console.log(note);

  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:3000/notes/${noteData.note.id}/events`
    );

    const handleTagsGenerated = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      setTags(data.tags);
    };

    eventSource.addEventListener('NOTE_TAGS_GENERATED', handleTagsGenerated);

    return () => {
      eventSource.removeEventListener(
        'NOTE_TAGS_GENERATED',
        handleTagsGenerated
      );

      eventSource.close();
    };
  }, [noteData.note.id]);

  return (
    <div className={styles.content}>
      <div className={styles.content__header}>
        <h2>{noteData.note.title}</h2>

        <NoteDetailOptions note={noteData.note} />
      </div>

      {/* Note with existing tags → should show noteData.tags  */}
      {noteData.tags && noteData.tags.length > 0 ? (
        <ul className={styles.tags}>
          {noteData.tags.map((tag) => (
            <li key={tag.id}>
              <Tag label={tag.name} />
            </li>
          ))}
        </ul>
      ) : (
        <>
          {tags.length > 0 ? (
            <ul className={styles.tags}>
              {tags.map((tag) => (
                <li key={tag.id}>
                  <Tag label={tag.name} />
                </li>
              ))}
            </ul>
          ) : (
            <p>Tags are being generated.</p>
          )}
        </>
      )}

      <p className={styles.content__text}>{noteData.note.content}</p>
      {relatedData.length > 0 && (
        <div className={styles.related}>
          <p>Related Notes</p>
          <ul>
            {relatedData.map((note) => (
              <li key={note.id}>
                <NavLink to={paths.app.notes.note.getHref(note.id)}>
                  {note.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function NoteDetailOptions({ note }: { note: Note }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;

      if (!containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const onSubmit = async () => {
    await deleteNote(note.id);
    navigate(paths.app.root.getHref());
    await revalidate();
  };

  const handleClick = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={styles.dropdown_container}>
      <Button type='button' onClick={handleClick}>
        <EllipsisVertical size={24} />
      </Button>

      <div
        className={styles.dropdown}
        aria-expanded={isExpanded}
        ref={containerRef}
      >
        <NavLink
          to={paths.app.notes.edit.getHref(note.id)}
          className={styles.option}
        >
          <Edit size={16} /> Edit
        </NavLink>

        <form onSubmit={handleSubmit(onSubmit)}>
          <button
            type='submit'
            className={styles.option}
            disabled={isSubmitting}
          >
            <Trash size={16} /> Delete
          </button>
        </form>
      </div>
    </div>
  );
}
