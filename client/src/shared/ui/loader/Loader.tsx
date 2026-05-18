import styles from './Loader.module.css';

export default function Loader() {
  return (
    <div className={styles.container}>
      <p className={styles.text}>Loading...</p>
      <span className={styles.loader}></span>
    </div>
  );
}
