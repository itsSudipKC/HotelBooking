import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';

const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, isLoading } = useAuth(role);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/${role}/login`} state={{ from }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
