import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Hotel, CheckCircle2, Clock, XCircle, CalendarRange } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import Spinner from '../../components/Spinner';
import { useAdminSession } from '../../hooks/useAdminSession';
import { getSummary } from '../../services/adminDashboardService';

const QUICK_LINKS = [
  { icon: Users, label: 'Manage Users', to: '/admin/users' },
  { icon: Building2, label: 'Manage Owners', to: '/admin/owners' },
  { icon: Hotel, label: 'Manage Hotels', to: '/admin/hotels' },
  { icon: CalendarRange, label: 'Manage Bookings', to: '/admin/bookings' },
];

const AdminDashboardPage = () => {
  const { account, accessToken, toast, handleLogout } = useAdminSession();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    getSummary(accessToken)
      .then((res) => active && setSummary(res.data))
      .catch(() => active && toast.error('Could not load dashboard data.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return (
    <DashboardLayout role="admin" accountName={account?.name} onLogout={handleLogout}>
      <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {account?.name?.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-gray-500">Platform overview.</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Users} label="Total Users" value={summary.totalUsers} accent="brand" />
          <StatCard icon={Building2} label="Total Hotel Owners" value={summary.totalOwners} accent="brand" />
          <StatCard icon={Hotel} label="Total Hotels" value={summary.hotels.total} accent="gray" />
          <StatCard icon={Clock} label="Pending Hotels" value={summary.hotels.pending} accent="amber" />
          <StatCard icon={CheckCircle2} label="Approved Hotels" value={summary.hotels.approved} accent="emerald" />
          <StatCard icon={XCircle} label="Rejected Hotels" value={summary.hotels.rejected} accent="red" />
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map(({ icon: Icon, label, to }) => (
          <Link
            key={label}
            to={to}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-900 shadow-sm transition hover:border-brand-500 hover:text-brand-600"
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
