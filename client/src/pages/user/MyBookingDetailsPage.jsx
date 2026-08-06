import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/dashboard/Badge';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useUserSession } from '../../hooks/useUserSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getMyBookingById, cancelBooking } from '../../services/bookingService';

const CANCELLABLE = ['pending', 'confirmed'];

const MyBookingDetailsPage = () => {
  const { id } = useParams();
  const { account, accessToken, toast, handleLogout } = useUserSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    getMyBookingById(accessToken, id)
      .then((res) => setBooking(res.data.booking))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [accessToken, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      await cancelBooking(accessToken, id);
      toast.success('Booking cancelled.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <DashboardLayout role="user" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/user/bookings" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to my bookings
      </Link>

      {loading || !booking ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="mt-4 max-w-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{booking.hotel?.name}</h1>
            <Badge value={booking.status} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4" /> {booking.hotel?.address?.city}, {booking.hotel?.address?.country}
          </p>

          {booking.status === 'rejected' && booking.cancellationReason && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <strong>Reason:</strong> {booking.cancellationReason}
            </div>
          )}
          {booking.status === 'pending' && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              Waiting for the hotel to confirm your request.
            </div>
          )}
          {booking.status === 'confirmed' && booking.payment?.status === 'success' && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              Payment received via {booking.payment.method === 'esewa' ? 'eSewa' : 'Khalti'}. You&apos;re all set.
            </div>
          )}
          {booking.status === 'confirmed' && booking.payment?.status !== 'success' && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700">
              <span>Your booking is confirmed — pay now to complete it.</span>
              <Link to={`/user/bookings/${booking._id}/pay`}>
                <Button className="shrink-0">Pay Now</Button>
              </Link>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Stay details</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <dt className="text-gray-500">Room</dt>
              <dd className="text-gray-900">{booking.room?.type}</dd>
              <dt className="text-gray-500">Check-in</dt>
              <dd className="text-gray-900">{new Date(booking.checkIn).toLocaleDateString()}</dd>
              <dt className="text-gray-500">Check-out</dt>
              <dd className="text-gray-900">{new Date(booking.checkOut).toLocaleDateString()}</dd>
              <dt className="text-gray-500">Guests</dt>
              <dd className="text-gray-900">{booking.guests}</dd>
              <dt className="text-gray-500">Nights</dt>
              <dd className="text-gray-900">{booking.nights}</dd>
              <dt className="text-gray-500">Invoice #</dt>
              <dd className="text-gray-900">{booking.invoiceNumber}</dd>
            </dl>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Price</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Room ({booking.nights} nights)</span>
                <span>Rs. {booking.roomPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>Rs. {booking.taxes.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
                <span>Total</span>
                <span>Rs. {booking.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {CANCELLABLE.includes(booking.status) && (
            <Button variant="secondary" className="mt-6 text-red-600" loading={cancelling} onClick={handleCancel}>
              Cancel booking
            </Button>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyBookingDetailsPage;
