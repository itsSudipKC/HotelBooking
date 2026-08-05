import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Building2, BedDouble, Star } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/dashboard/Badge';
import StatCard from '../../components/dashboard/StatCard';
import HotelCard from '../../components/HotelCard';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useAdminSession } from '../../hooks/useAdminSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import * as adminOwnerService from '../../services/adminOwnerService';

const OwnerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, accessToken, toast, handleLogout } = useAdminSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    adminOwnerService
      .getOwnerById(accessToken, id)
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
      <Link to="/admin/owners" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to owners
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
                {data.owner.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{data.owner.name}</h1>
                <p className="text-sm text-gray-500">
                  {data.owner.businessName || 'No business name on file'} · {data.owner.email}
                </p>
              </div>
              <Badge value={data.owner.status} />
            </div>
            <div className="flex gap-2">
              {data.owner.status === 'active' ? (
                <Button variant="secondary" onClick={() => runAction(adminOwnerService.suspendOwner)}>
                  Suspend
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => runAction(adminOwnerService.activateOwner)}>
                  Activate
                </Button>
              )}
              <Button
                variant="secondary"
                className="text-red-600"
                onClick={() =>
                  runAction(adminOwnerService.deleteOwner, `Delete ${data.owner.name}? This cannot be undone.`, () =>
                    navigate('/admin/owners')
                  )
                }
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard icon={Building2} label="Hotels" value={data.stats.hotelCount} accent="brand" />
            <StatCard icon={BedDouble} label="Total Rooms" value={data.stats.totalRooms} accent="gray" />
            <StatCard icon={Star} label="Avg. Rating" value={data.stats.avgRating || '—'} accent="amber" />
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Phone: {data.owner.phone || '—'} · Joined {new Date(data.owner.createdAt).toLocaleDateString()}. Revenue
            tracking arrives with the Payments module.
          </p>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Hotels</h2>
            {data.hotels.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">This owner has no hotels listed yet.</p>
            ) : (
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.hotels.map((hotel) => (
                  <div key={hotel._id} className="relative">
                    <div className="absolute right-3 top-3 z-10">
                      <Badge value={hotel.status} />
                    </div>
                    <HotelCard hotel={hotel} linkTo={`/admin/hotels/${hotel._id}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default OwnerDetailsPage;
