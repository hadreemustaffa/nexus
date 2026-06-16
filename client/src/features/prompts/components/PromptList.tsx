import type { ApiResponse } from '@nexus/shared';
import { PlusIcon } from 'lucide-react';
import { NavLink, useLoaderData } from 'react-router';

import { paths } from '../../../config/paths';
import type { Prompt as PromptType } from '../types';
import Prompt from './Prompt';
import styles from './PromptList.module.css';

export default function PromptList() {
  const { data } = useLoaderData<ApiResponse<{ prompts: PromptType[] }>>();

  const prompts = data.prompts;

  const grouped = prompts.reduce<Record<string, PromptType[]>>(
    (acc, prompt) => {
      if (!acc[prompt.key]) {
        acc[prompt.key] = [];
      }
      acc[prompt.key].push(prompt);
      return acc;
    },
    {}
  );

  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        <NavLink
          to={paths.app.settings.prompts.create.getHref()}
          className={`btn btn_primary_action`}
        >
          <PlusIcon size={16} /> Create
        </NavLink>
      </div>

      <div className={styles.list_container}>
        {prompts.length > 0 ? (
          <>
            {Object.entries(grouped).map(([key, versionedPrompts]) => (
              <div key={key} className={styles.list_group}>
                <h3 className={styles.list_group_name}>{key}</h3>
                <ul>
                  {versionedPrompts.map((prompt) => (
                    <li key={prompt.id}>
                      <Prompt prompt={prompt} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        ) : (
          <p>No prompts found.</p>
        )}
      </div>
    </div>
  );
}
