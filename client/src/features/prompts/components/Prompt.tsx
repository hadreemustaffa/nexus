import type { Prompt } from '../types';
import styles from './Prompt.module.css';

export default function Prompt({ prompt }: { prompt: Prompt }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.version}>v{prompt.version}</p>
        <div className={styles.status}>
          {prompt.isActive && (
            <span className={`${styles.active} tag`}>Active</span>
          )}
          {prompt.isDefault && (
            <span className={`${styles.default} tag`}>Default</span>
          )}
        </div>
      </div>
    </div>
  );
}
