import styles from './Tag.module.css';

export default function Tag({ label }: { label: string }) {
  return <span className={styles.tag}>{label}</span>;
}
