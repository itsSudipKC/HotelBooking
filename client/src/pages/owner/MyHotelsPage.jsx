import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/dashboard/Badge';
import HotelCard from '../../components/HotelCard';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useOwnerSession } from '../../hooks/useOwnerSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { listMyHotels } from '../../services/ownerHotelService';

const MyHotelsPage = () => {
  const { account, accessToken, toast, handleLogout } = useOwnerSession();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    listMyHotels(accessToken)
      .then((res) => setHotels(res.data.hotels))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return (
    <DashboardLayout role="owner" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/owner/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to dashboard
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">My Hotels</h1>
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
      ) : hotels.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Building2 className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-4 font-medium text-gray-900">You haven&apos;t listed a hotel yet</p>
          <p className="mt-1 text-sm text-gray-500">Add your first property to start taking bookings.</p>
          <Link to="/owner/hotels/add">
            <Button className="mt-4">Add Hotel</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <div key={hotel._id} className="relative">
              <div className="absolute right-3 top-3 z-10">
                <Badge value={hotel.status} />
              </div>
              <HotelCard hotel={hotel} linkTo={`/owner/hotels/${hotel._id}`} />
              <p className="mt-1 text-xs text-gray-400">{hotel.roomCount} room type(s)</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyHotelsPage;
