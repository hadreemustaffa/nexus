import { RotateCw, TriangleAlertIcon } from 'lucide-react';

import Button from '../button/Button';
import styles from './Errors.module.css';

export const MainErrorFallback = () => {
  return (
    <div role='alert' className={styles.error}>
      <div className={styles.error_icon}>
        <TriangleAlertIcon size={16} />
      </div>
      <h2>Something went wrong</h2>
      <Button
        type='button'
        onClick={() => window.location.assign(window.location.origin)}
      >
        <RotateCw size={16} /> Try again
      </Button>
    </div>
  );
};
