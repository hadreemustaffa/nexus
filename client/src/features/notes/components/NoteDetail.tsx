import { Edit, EllipsisVertical, RefreshCw, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Form, NavLink, useFetcher, useLoaderData } from 'react-router';

import { paths } from '../../../config/paths';
import Button from '../../../shared/ui/button/Button';
import Tag from '../../tags/Tag';
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
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:3000/notes/${noteData.note.id}/events`
    );

    // handle state on our own rather than depend on fetcher.state
    // fetcher.state returns to idle faster than tags finish generating
    // this causes brief flicker then showing old tags
    const handleTagsGenerated = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      setTags(data.tags);
      setIsGenerating(false);
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

        <NoteDetailOptions
          note={noteData.note}
          onRegenerate={() => setIsGenerating(true)}
        />
      </div>

      {!isGenerating && noteData.tags && noteData.tags.length > 0 ? (
        <ul className={styles.tags}>
          {noteData.tags.map((tag) => (
            <li key={tag.id}>
              <Tag label={tag.name} />
            </li>
          ))}
        </ul>
      ) : isGenerating || tags.length === 0 ? (
        <p>Tags are being generated.</p>
      ) : (
        <ul className={styles.tags}>
          {tags.map((tag) => (
            <li key={tag.id}>
              <Tag label={tag.name} />
            </li>
          ))}
        </ul>
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

function NoteDetailOptions({
  note,
  onRegenerate,
}: {
  note: Note;
  onRegenerate: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';

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

        <Form id='delete-form' method='post' replace>
          <button
            id='delete'
            type='submit'
            className={`${styles.option} ${styles.delete}`}
          >
            <Trash size={16} />
            Delete
          </button>
        </Form>

        <fetcher.Form
          id='regenerate-note-tags-form'
          method='post'
          action={paths.app.notes.regenerateNoteTags.getHref(note.id)}
          onSubmit={onRegenerate}
        >
          <button
            id='regenerate-note-tags'
            type='submit'
            className={styles.option}
            disabled={isSubmitting}
          >
            <RefreshCw
              size={16}
              className={`${isSubmitting ? styles.submitting : ''}`}
            />
            Regenerate Tags
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}
