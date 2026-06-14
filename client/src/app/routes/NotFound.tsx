import { Link } from 'react-router';

import { paths } from '../../config/paths';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.container}>
      <div>
        <h1>404 - Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <Link to={paths.app.root.getHref()} replace>
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
