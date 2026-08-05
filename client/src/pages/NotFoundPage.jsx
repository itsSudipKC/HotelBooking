import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 text-center">
    <h1 className="text-4xl font-semibold text-gray-900">404</h1>
    <p className="text-sm text-gray-500">The page you're looking for doesn't exist.</p>
    <Link to="/" className="text-sm font-medium text-brand-600 hover:underline">
      Back to home
    </Link>
  </div>
);

export default NotFoundPage;
