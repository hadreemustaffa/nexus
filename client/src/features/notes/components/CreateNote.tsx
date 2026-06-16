import { zodResolver } from '@hookform/resolvers/zod';
import { countWords } from '@nexus/shared';
import { createNoteBodySchema } from '@nexus/shared/note';
import { type ChangeEvent, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useFetcher } from 'react-router';
import type { z } from 'zod';

import { paths } from '../../../config/paths';
import useDebounce from '../../../hooks/useDebounce';
import Button from '../../../shared/ui/button/Button';
import styles from './CreateNote.module.css';

type FormValues = z.infer<typeof createNoteBodySchema>;

export default function CreateNote() {
  const [contentLength, setContentLength] = useState(0);
  const fetcher = useFetcher();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createNoteBodySchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await fetcher.submit(data, {
      method: 'post',
      action: paths.app.notes.create.getHref(),
    });
  };

  const handleChange = useDebounce((value: string) => {
    setContentLength(countWords(value));
  }, 500);

  return (
    <div className={styles.container}>
      <h2>Create a new note</h2>

      <form
        className={styles.form}
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      >
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
                onChange: (e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange(e.target.value),
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

        <div>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
}
