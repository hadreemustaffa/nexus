import { Settings } from 'lucide-react';

import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <Settings />
    </header>
  );
}
