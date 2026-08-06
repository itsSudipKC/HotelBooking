import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

// Same shape as useOwnerSession/useAdminSession, for the /user/bookings* pages.
export const useUserSession = () => {
  const { session, logout, updateAccount } = useAuth('user');
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out.');
    navigate('/user/login');
  };

  return { account: session?.account, accessToken: session?.accessToken, toast, handleLogout, updateAccount };
};
