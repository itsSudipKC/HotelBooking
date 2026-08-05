import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

// Same shape as useAdminSession — the account, its access token, and a
// logout handler — for the owner-scoped hotel/room management pages.
export const useOwnerSession = () => {
  const { session, logout } = useAuth('owner');
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out.');
    navigate('/owner/login');
  };

  return { account: session?.account, accessToken: session?.accessToken, toast, handleLogout };
};
