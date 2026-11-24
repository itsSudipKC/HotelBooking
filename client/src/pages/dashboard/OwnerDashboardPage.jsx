// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Building2, CheckCircle2, Clock, XCircle, BedDouble, Plus, Settings, CalendarRange } from 'lucide-react';
// import DashboardLayout from '../../layouts/DashboardLayout';
// import StatCard from '../../components/dashboard/StatCard';
// import Spinner from '../../components/Spinner';
// import Button from '../../components/Button';
// import { useOwnerSession } from '../../hooks/useOwnerSession';
// import { getSummary } from '../../services/ownerDashboardService';

// const OwnerDashboardPage = () => {
//   const { account, accessToken, toast, handleLogout } = useOwnerSession();
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!accessToken) return undefined;
//     let active = true;
//     getSummary(accessToken)
//       .then((res) => active && setSummary(res.data))
//       .catch(() => active && toast.error('Could not load dashboard data.'))
//       .finally(() => active && setLoading(false));
//     return () => {
//       active = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [accessToken]);

//   return (
//     <DashboardLayout role="owner" accountName={account?.name} onLogout={handleLogout}>
//       <div className="flex flex-wrap items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {account?.name?.split(' ')[0]}</h1>
//           <p className="mt-1 text-sm text-gray-500">Here&apos;s an overview of your properties.</p>
//         </div>
//         <Link to="/owner/hotels/add">
//           <Button className="gap-1.5">
//             <Plus className="h-4 w-4" />
//             Add Hotel
//           </Button>
//         </Link>
//       </div>

//       {loading ? (
//         <div className="flex justify-center py-16">
//           <Spinner />
//         </div>
//       ) : summary?.hotels.total === 0 ? (
//         <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
//           <Building2 className="mx-auto h-10 w-10 text-gray-300" />
//           <p className="mt-4 font-medium text-gray-900">You haven&apos;t listed a hotel yet</p>
//           <p className="mt-1 text-sm text-gray-500">Add your first property to start taking bookings.</p>
//           <Link to="/owner/hotels/add">
//             <Button className="mt-4">Add Hotel</Button>
//           </Link>
//         </div>
//       ) : (
//         <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
//           <StatCard icon={Building2} label="Total Hotels" value={summary.hotels.total} accent="brand" />
//           <StatCard icon={CheckCircle2} label="Approved" value={summary.hotels.approved} accent="emerald" />
//           <StatCard icon={Clock} label="Pending" value={summary.hotels.pending} accent="amber" />
//           <StatCard icon={XCircle} label="Rejected" value={summary.hotels.rejected} accent="red" />
//           <StatCard icon={BedDouble} label="Total Rooms" value={summary.totalRooms} accent="gray" />
//         </div>
//       )}

//       <div className="mt-8 grid gap-4 sm:grid-cols-3">
//         <Link
//           to="/owner/hotels"
//           className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-900 shadow-sm transition hover:border-brand-500 hover:text-brand-600"
//         >
//           <Building2 className="h-5 w-5" />
//           Manage Hotels
//         </Link>
//         <Link
//           to="/owner/bookings"
//           className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-900 shadow-sm transition hover:border-brand-500 hover:text-brand-600"
//         >
//           <CalendarRange className="h-5 w-5" />
//           Booking Requests
//         </Link>
//         <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-400">
//           <Settings className="h-5 w-5" />
//           Settings
//           <span className="ml-auto text-xs">Coming soon</span>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default OwnerDashboardPage;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  BedDouble,
  Plus,
  Settings,
  CalendarRange,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useOwnerSession } from '../../hooks/useOwnerSession';
import { getSummary, getEarnings } from '../../services/ownerDashboardService';

const currency = (value) =>
  new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(
    value || 0
  );

const statusStyles = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  rejected: 'bg-red-50 text-red-700',
};

const methodLabels = {
  esewa: 'eSewa',
  khalti: 'Khalti',
};

const OwnerDashboardPage = () => {
  const { account, accessToken, toast, handleLogout } = useOwnerSession();
  const [summary, setSummary] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [earningsLoading, setEarningsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    getSummary(accessToken)
      .then((data) => active && setSummary(data.data))
      .catch(() => active && toast.error('Could not load dashboard data.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    getEarnings(accessToken)
      .then((data) => active && setEarnings(data.data))
      .catch(() => active && toast.error('Could not load earnings data.'))
      .finally(() => active && setEarningsLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return (
    <DashboardLayout role="owner" accountName={account?.name} onLogout={handleLogout}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {account?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-gray-500">Here&apos;s an overview of your properties.</p>
        </div>
        <Link to="/owner/hotels/add">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Hotel
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : summary?.hotels.total === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Building2 className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-4 font-medium text-gray-900">You haven&apos;t listed a hotel yet</p>
          <p className="mt-1 text-sm text-gray-500">Add your first property to start taking bookings.</p>
          <Link to="/owner/hotels/add">
            <Button className="mt-4">Add Hotel</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={Building2} label="Total Hotels" value={summary.hotels.total} accent="brand" />
          <StatCard icon={CheckCircle2} label="Approved" value={summary.hotels.approved} accent="emerald" />
          <StatCard icon={Clock} label="Pending" value={summary.hotels.pending} accent="amber" />
          <StatCard icon={XCircle} label="Rejected" value={summary.hotels.rejected} accent="red" />
          <StatCard icon={BedDouble} label="Total Rooms" value={summary.totalRooms} accent="gray" />
        </div>
      )}

      {/* Earnings section */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Earnings</h2>

        {earningsLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={Wallet}
                label="Total Earnings"
                value={currency(earnings?.totalEarnings)}
                accent="brand"
              />
              <StatCard
                icon={TrendingUp}
                label="This Month"
                value={currency(earnings?.monthEarnings)}
                accent="emerald"
              />
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-5 py-3">
                <h3 className="text-sm font-medium text-gray-900">Recent Earnings</h3>
              </div>

              {earnings?.transactions?.length ? (
                <ul className="divide-y divide-gray-100">
                  {earnings.transactions.map((tx) => {
                    const paidOnline = tx.payment && tx.payment.status === 'success';
                    return (
                      <li key={tx._id} className="flex items-center justify-between gap-4 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {tx.user?.name || 'Guest'} · {tx.hotel?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(tx.recognizedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                            {' · '}
                            {paidOnline ? (
                              <span className="text-emerald-600">
                                Paid via {methodLabels[tx.payment.method] || tx.payment.method}
                              </span>
                            ) : (
                              <span className="text-gray-500">Collected at checkout</span>
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[tx.status] || 'bg-gray-100 text-gray-600'
                              }`}
                          >
                            {tx.status}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">{currency(tx.totalPrice)}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-5 py-6 text-center text-sm text-gray-500">No earnings recorded yet.</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          to="/owner/hotels"
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-900 shadow-sm transition hover:border-brand-500 hover:text-brand-600"
        >
          <Building2 className="h-5 w-5" />
          Manage Hotels
        </Link>
        <Link
          to="/owner/bookings"
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-900 shadow-sm transition hover:border-brand-500 hover:text-brand-600"
        >
          <CalendarRange className="h-5 w-5" />
          Booking Requests
        </Link>
        {/* <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-400">
          <Settings className="h-5 w-5" />
          Settings
          <span className="ml-auto text-xs">Coming soon</span>
        </div> */}
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboardPage;
