import { Link } from 'react-router-dom';
import { Hotel, LogOut } from 'lucide-react';
import Button from '../components/Button';

const ROLE_LABELS = {
  user: 'Guest',
  owner: 'Hotel Owner',
  admin: 'Admin',
};

const DashboardLayout = ({ role, accountName, onLogout, children }) => (
  <div className="min-h-screen bg-gray-50">
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-brand-600">
          <Hotel className="h-6 w-6" />
          StayNepal
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray-400">{ROLE_LABELS[role]}</p>
            <p className="text-sm font-medium text-gray-900">{accountName}</p>
          </div>
          <Button variant="secondary" onClick={onLogout} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
  </div>
);

export default DashboardLayout;
