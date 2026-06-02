import { zodResolver } from '@hookform/resolvers/zod';
import { countWords, editNoteFormSchema } from '@nexus/shared/note';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink, useFetcher, useLoaderData } from 'react-router';
import type { z } from 'zod';

import { paths } from '../../../config/paths';
import useDebounce from '../../../hooks/useDebounce';
import Button from '../../../shared/ui/button/Button';
import type { NoteWithTags, Response } from '../types';
import styles from './EditNote.module.css';

type FormValues = z.infer<typeof editNoteFormSchema>;

export default function EditNote() {
  const { note } = useLoaderData() as {
    note: Response<NoteWithTags>;
  };

  const fetcher = useFetcher<{ error?: string }>();
  const isSubmitting = fetcher.state !== 'idle';

  const noteData = note.data;
  const initialWordCount = countWords(noteData.note.content);

  const [contentLength, setContentLength] = useState(initialWordCount);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(editNoteFormSchema),
    defaultValues: {
      id: noteData.note.id,
      title: noteData.note.title,
      content: noteData.note.content,
    },
  });

  const onSubmit = (data: FormValues) => {
    fetcher.submit(data, {
      method: 'post',
      action: paths.app.notes.edit.getHref(noteData.note.id),
    });
  };

  const handleChange = useDebounce((value: string) => {
    setContentLength(countWords(value));
  }, 500);

  return (
    <div className={styles.container}>
      <h2>Edit note</h2>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <input type='hidden' {...register('id')} value={noteData.note.id} />
        <div>
          <div className={styles.form__group}>
            <label htmlFor='title'>Title:</label>
            <input
              id='title'
              type='text'
              className={styles.form__input_title}
              {...register('title')}
              disabled={isSubmitting}
            />
          </div>
          {errors.title && (
            <span className={styles.form__error}>{errors.title.message}</span>
          )}
        </div>

        <div>
          <div className={styles.form__group}>
            <label htmlFor='content'>Content:</label>
            <textarea
              id='content'
              className={styles.form__input_content}
              {...register('content', {
                onChange: (e) => handleChange(e.target.value),
              })}
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.form__input_content_footer}>
            {errors.content && (
              <span className={styles.form__error}>
                {errors.content.message}
              </span>
            )}
            {contentLength !== 0 && (
              <p className={styles.form__content_length}>
                {contentLength} words
              </p>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <NavLink
            to={paths.app.notes.note.getHref(noteData.note.id)}
            className={styles.actions__cancel}
          >
            Cancel
          </NavLink>

          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>

      {fetcher.data?.error && (
        <p className={styles.form__error}>{fetcher.data.error}</p>
      )}
    </div>
  );
}
