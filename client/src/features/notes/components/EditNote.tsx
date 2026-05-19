import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  NavLink,
  useLoaderData,
  useNavigate,
  useRevalidator,
} from 'react-router';
import { z } from 'zod';

import { paths } from '../../../config/paths';
import useDebounce from '../../../hooks/useDebounce';
import Button from '../../../shared/ui/button/Button';
import { updateNote } from '../api/notes.api';
import type { NoteWithTags, Response } from '../types';
import styles from './EditNote.module.css';

const schema = z.object({
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

  const noteData = note.data;
  const wordCount = noteData.note.content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const [contentLength, setContentLength] = useState(wordCount);

  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: noteData.note.title,
      content: noteData.note.content,
    },
  });

  const onSubmit = async (data: FormValues) => {
    await updateNote(noteData.note.id, data);
    navigate(paths.app.notes.note.getHref(noteData.note.id));
    await revalidate();
  };

  const handleChange = useDebounce((value: string) => {
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    setContentLength(wordCount);
  }, 500);

  return (
    <div className={styles.container}>
      <h2>Edit note</h2>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
    </div>
  );
}
