import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarRange } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/dashboard/Badge';
import Spinner from '../../components/Spinner';
import { useUserSession } from '../../hooks/useUserSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { listMyBookings } from '../../services/bookingService';

const TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Rejected', value: 'rejected' },
];

const MyBookingsPage = () => {
  const { account, accessToken, toast, handleLogout } = useUserSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    listMyBookings(accessToken, tab ? { status: tab } : undefined)
      .then((res) => setBookings(res.data.bookings))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, tab]);

  return (
    <DashboardLayout role="user" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/user/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">My Bookings</h1>

      <div className="mt-4 flex gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
              tab === t.value ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <CalendarRange className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-4 font-medium text-gray-900">No bookings here yet</p>
          <p className="mt-1 text-sm text-gray-500">
            <Link to="/hotels" className="text-brand-600 hover:underline">
              Browse hotels
            </Link>{' '}
            to plan your next stay.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {bookings.map((booking) => (
            <Link
              key={booking._id}
              to={`/user/bookings/${booking._id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand-500"
            >
              <div>
                <p className="font-medium text-gray-900">{booking.hotel?.name}</p>
                <p className="text-sm text-gray-500">
                  {booking.room?.type} · {new Date(booking.checkIn).toLocaleDateString()} →{' '}
                  {new Date(booking.checkOut).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold text-brand-600">Rs. {booking.totalPrice.toLocaleString()}</p>
                <Badge value={booking.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyBookingsPage;
