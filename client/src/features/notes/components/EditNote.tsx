import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink, useFetcher, useLoaderData } from 'react-router';
import { z } from 'zod';

import { paths } from '../../../config/paths';
import useDebounce from '../../../hooks/useDebounce';
import Button from '../../../shared/ui/button/Button';
import type { NoteWithTags, Response } from '../types';
import styles from './EditNote.module.css';

const schema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  content: z
    .string()
    .min(1, 'Content is required')
    .refine(
      (val) => val.trim().split(/\s+/).filter(Boolean).length >= 100,
      'Content must be at least 100 words'
    ),
});

type FormValues = z.infer<typeof schema>;

export default function EditNote() {
  const { note } = useLoaderData() as {
    note: Response<NoteWithTags>;
  };

  const fetcher = useFetcher<{ error?: string }>();
  const isSubmitting = fetcher.state !== 'idle';

  const noteData = note.data;
  const wordCount = noteData.note.content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const [contentLength, setContentLength] = useState(wordCount);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
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
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    setContentLength(wordCount);
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
