import { Link } from 'react-router';

import { paths } from '../../config/paths';

const NotFoundRoute = () => {
  return (
    <div className='not-found'>
      <h1>404 - Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to={paths.app.root.getHref()} replace>
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundRoute;
