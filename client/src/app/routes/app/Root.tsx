// import { Outlet } from 'react-router';
import { NotesView } from '../../../features/notes';
import styles from './Root.module.css';

export const ErrorBoundary = () => {
  return <div>Something went wrong!</div>;
};

const AppRoot = () => {
  return (
    <main className={styles.container}>
      <h1>Nexus</h1>
      <NotesView />
    </main>
  );
};

export default AppRoot;
