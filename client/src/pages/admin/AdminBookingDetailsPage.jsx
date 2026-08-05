import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/dashboard/Badge';
import Spinner from '../../components/Spinner';
import { useAdminSession } from '../../hooks/useAdminSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getBookingById } from '../../services/adminBookingService';

const AdminBookingDetailsPage = () => {
  const { id } = useParams();
  const { account, accessToken, toast, handleLogout } = useAdminSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    getBookingById(accessToken, id)
      .then((res) => setBooking(res.data.booking))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, id]);

  return (
    <DashboardLayout role="admin" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/admin/bookings" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to bookings
      </Link>

      {loading || !booking ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">Booking #{booking._id.slice(-8).toUpperCase()}</h1>
            <Badge value={booking.status} />
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <section className="rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900">Guest</h2>
              <p className="mt-2 text-sm text-gray-600">{booking.user?.name}</p>
              <p className="text-sm text-gray-500">{booking.user?.email}</p>
              <p className="text-sm text-gray-500">{booking.user?.phone || '—'}</p>
            </section>

            <section className="rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900">Hotel</h2>
              <p className="mt-2 text-sm text-gray-600">{booking.hotel?.name}</p>
              <p className="text-sm text-gray-500">
                {booking.hotel?.address?.city}, {booking.hotel?.address?.country}
              </p>
              <p className="text-sm text-gray-500">Owner: {booking.hotel?.owner?.name}</p>
            </section>

            <section className="rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900">Reservation</h2>
              <p className="mt-2 text-sm text-gray-600">Room: {booking.room?.type}</p>
              <p className="text-sm text-gray-500">Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Check-out: {new Date(booking.checkOut).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">
                {booking.nights} night{booking.nights === 1 ? '' : 's'} · {booking.guests} guest
                {booking.guests === 1 ? '' : 's'}
              </p>
            </section>

            <section className="rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
              <p className="mt-2 text-sm text-gray-600">Total: Rs. {booking.totalPrice.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Room price: Rs. {booking.roomPrice.toLocaleString()}</p>
              <p className="text-sm text-gray-500">
                Taxes: Rs. {booking.taxes.toLocaleString()} · Discount: Rs. {booking.discount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Invoice: {booking.invoiceNumber || 'Not generated'} · Booked{' '}
                {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </section>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminBookingDetailsPage;
