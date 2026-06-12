import { zodResolver } from '@hookform/resolvers/zod';
import { countCharacters, createPromptBodySchema } from '@nexus/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFetcher } from 'react-router';
import type z from 'zod';

import { paths } from '../../../config/paths';
import useDebounce from '../../../hooks/useDebounce';
import Button from '../../../shared/ui/button/Button';
import styles from './CreatePrompt.module.css';

type FormValues = z.infer<typeof createPromptBodySchema>;

export default function CreatePrompt() {
  const [contentLength, setContentLength] = useState(0);
  const fetcher = useFetcher();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createPromptBodySchema),
  });

  const onSubmit = (data: FormValues) => {
    fetcher.submit(data, {
      method: 'post',
      action: paths.app.settings.prompts.create.getHref(),
    });
  };

  const handleChange = useDebounce((value: string) => {
    setContentLength(countCharacters(value));
  }, 500);

  return (
    <div className={styles.container}>
      <h2>Create a new prompt</h2>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className={styles.form__group}>
            <label htmlFor='key'>Key:</label>
            <input
              id='key'
              type='text'
              className={styles.form__input_key}
              {...register('key')}
              disabled={isSubmitting}
            />
          </div>
          {errors.key && (
            <span className={styles.form__error}>{errors.key.message}</span>
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
                {contentLength} characters
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
