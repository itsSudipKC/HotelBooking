import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

// Every /admin/* management page needs the same three things — the account,
// its access token, and a logout handler — so this collects them in one
// place instead of repeating the same block on every page.
export const useAdminSession = () => {
  const { session, logout } = useAuth('admin');
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out.');
    navigate('/admin/login');
  };

  return { account: session?.account, accessToken: session?.accessToken, toast, handleLogout };
};
