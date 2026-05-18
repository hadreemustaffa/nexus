import Header from '../header/Header';
import styles from './AppLayout.module.css';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.container}>
      <Header />

      {children}
    </div>
  );
};

export default AppLayout;
