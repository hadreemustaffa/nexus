import type React from 'react';

import styles from './SettingsLayout.module.css';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className={styles.layout}>{children}</main>;
}
