import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const ROLE_LABELS = {
  user: 'Guest',
  owner: 'Hotel Owner',
  admin: 'Admin',
};

// Placeholder landing page after login — the real Admin/Owner/User
// dashboards (stats, charts, bookings, etc.) are a later module.
const DashboardPage = ({ role }) => {
  const { session, logout } = useAuth(role);
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out.');
    navigate(`/${role}/login`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center dark:bg-gray-950">
      <p className="text-xs uppercase tracking-wide text-gray-400">{ROLE_LABELS[role]} Dashboard</p>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Welcome, {session?.account?.name}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Signed in as {session?.account?.email} ({session?.account?.role})
      </p>
      <p className="max-w-md text-sm text-gray-400">
        This is a placeholder — hotel management, bookings, and analytics land in later modules.
      </p>
      <Button variant="secondary" onClick={handleLogout}>
        Log out
      </Button>
    </div>
  );
};

export default DashboardPage;
