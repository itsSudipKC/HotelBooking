import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/dashboard/Badge';
import StatCard from '../../components/dashboard/StatCard';
import StarRating from '../../components/StarRating';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useAdminSession } from '../../hooks/useAdminSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import * as adminUserService from '../../services/adminUserService';
import { CalendarCheck, Wallet, Star } from 'lucide-react';

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, accessToken, toast, handleLogout } = useAdminSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    adminUserService
      .getUserById(accessToken, id)
      .then((res) => setData(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [accessToken, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const runAction = async (action, confirmMsg, after) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    try {
      await action(accessToken, id);
      toast.success('Done.');
      if (after) after();
      else load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout role="admin" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/admin/users" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to users
      </Link>

      {loading || !data ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700">
                {data.user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{data.user.name}</h1>
                <p className="text-sm text-gray-500">{data.user.email}</p>
              </div>
              <Badge value={data.user.status} />
            </div>
            <div className="flex gap-2">
              {data.user.status === 'active' ? (
                <Button variant="secondary" onClick={() => runAction(adminUserService.suspendUser)}>
                  Suspend
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => runAction(adminUserService.activateUser)}>
                  Activate
                </Button>
              )}
              <Button
                variant="secondary"
                className="text-red-600"
                onClick={() =>
                  runAction(adminUserService.deleteUser, `Delete ${data.user.name}? This cannot be undone.`, () =>
                    navigate('/admin/users')
                  )
                }
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard icon={CalendarCheck} label="Bookings" value={data.bookingCount} accent="brand" />
            <StatCard icon={Wallet} label="Total Spending" value={`Rs. ${data.totalSpent.toLocaleString()}`} accent="gray" />
            <StatCard icon={Star} label="Reviews Written" value={data.reviews.length} accent="amber" />
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Phone: {data.user.phone || '—'} · Joined {new Date(data.user.createdAt).toLocaleDateString()} · Email{' '}
              {data.user.isEmailVerified ? 'verified' : 'not verified'}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
            <div className="mt-4 flex flex-col gap-4">
              {data.reviews.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews written yet.</p>
              ) : (
                data.reviews.map((review) => (
                  <div key={review._id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{review.hotel?.name}</p>
                      <StarRating rating={review.rating} showValue={false} size={14} />
                    </div>
                    {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default UserDetailsPage;
