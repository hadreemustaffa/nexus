import { api, type ApiResponse } from '@nexus/shared';
import { Edit, EllipsisVertical, RefreshCw, Trash } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Form, NavLink, useFetcher, useLoaderData } from 'react-router';

import { paths } from '../../../config/paths';
import Button from '../../../shared/ui/button/Button';
import MarkdownBody from '../../../shared/ui/markdown-body/MarkdownBody';
import Tag from '../../tags/Tag';
import type { Note, NoteWithTags, Tag as TagType } from '../types';
import styles from './NoteDetail.module.css';

export default function NoteDetail() {
  const { note, related } = useLoaderData<{
    note: ApiResponse<NoteWithTags>;
    related: ApiResponse<Note[]>;
  }>();

  return (
    <NoteDetailContent
      key={note.data.note.id}
      note={note.data}
      related={related.data}
    />
  );
}

function NoteDetailContent({
  note,
  related,
}: {
  note: NoteWithTags;
  related: Note[];
}) {
  const [tags, setTags] = useState<TagType[]>(note.tags ?? []);
  const [isGenerating, setIsGenerating] = useState(false);

  const relatedByTitle = useMemo(() => {
    const map = new Map<string, Note>();
    for (const r of related) {
      map.set(r.title.toLowerCase(), r);
    }
    return map;
  }, [related]);

  useEffect(() => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}${api.notes.events.getRoute(note.note.id)}`
    );

    // handle state on our own rather than depend on fetcher.state
    // fetcher.state returns to idle faster than tags finish generating
    // this causes brief flicker then showing old tags
    const handleTagsGenerated = (event: MessageEvent<string>) => {
      const data = JSON.parse(event.data) as { tags: TagType[] };
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
  }, [note.note.id]);

  return (
    <div className={styles.content}>
      <div className={styles.content__header}>
        <h2>{note.note.title}</h2>

        <NoteDetailOptions
          note={note.note}
          onRegenerate={() => setIsGenerating(true)}
          isRegenerating={isGenerating}
        />
      </div>

      {isGenerating || tags.length === 0 ? (
        <p className={styles.generating}>
          <RefreshCw size={16} className={styles.submitting} />
          <span>Tags are being generated.</span>
        </p>
      ) : (
        <ul className={styles.tags}>
          {tags.map((tag) => (
            <li key={tag.id}>
              <Tag label={tag.name} />
            </li>
          ))}
        </ul>
      )}

      <MarkdownBody
        content={note.note.content}
        relatedByTitle={relatedByTitle}
      />

      {related.length > 0 && (
        <div className={styles.related}>
          <p>Related Notes</p>
          <ul>
            {related.map((note) => (
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
  isRegenerating,
}: {
  note: Note;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fetcher = useFetcher();

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
            disabled={isRegenerating}
          >
            <RefreshCw size={16} />
            Regenerate Tags
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}
