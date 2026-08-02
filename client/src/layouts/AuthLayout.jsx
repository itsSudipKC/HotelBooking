import { Link } from 'react-router-dom';

const ROLE_LABELS = {
  user: 'Guest',
  owner: 'Hotel Owner',
  admin: 'Admin',
};

const AuthLayout = ({ role, title, subtitle, children }) => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6 text-center">
        <Link to="/" className="text-lg font-semibold text-brand-600">
          Hotel Booking System
        </Link>
        <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">{ROLE_LABELS[role]} Portal</p>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  </div>
);

export default AuthLayout;
