import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';

const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, isLoading } = useAuth(role);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${role}/login`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
