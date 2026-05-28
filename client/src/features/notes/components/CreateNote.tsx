import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFetcher } from 'react-router';
import { z } from 'zod';

import { paths } from '../../../config/paths';
import useDebounce from '../../../hooks/useDebounce';
import Button from '../../../shared/ui/button/Button';
import styles from './CreateNote.module.css';

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

export default function CreateNote() {
  const [contentLength, setContentLength] = useState(0);
  const fetcher = useFetcher();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    fetcher.submit(data, {
      method: 'post',
      action: paths.app.notes.create.getHref(),
    });
  };

  const handleChange = useDebounce((value: string) => {
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    setContentLength(wordCount);
  }, 500);

  return (
    <div className={styles.container}>
      <h2>Create a new note</h2>

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

        <div>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
}
