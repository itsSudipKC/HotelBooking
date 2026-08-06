import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/dashboard/Badge';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useOwnerSession } from '../../hooks/useOwnerSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import * as ownerBookingService from '../../services/ownerBookingService';

const OwnerBookingDetailsPage = () => {
  const { id } = useParams();
  const { account, accessToken, toast, handleLogout } = useOwnerSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    ownerBookingService
      .getBookingById(accessToken, id)
      .then((res) => setBooking(res.data.booking))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [accessToken, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await ownerBookingService.acceptBooking(accessToken, id);
      toast.success('Booking accepted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for declining this request.');
      return;
    }
    setSubmitting(true);
    try {
      await ownerBookingService.rejectBooking(accessToken, id, reason.trim());
      toast.success('Booking rejected.');
      setRejecting(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="owner" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/owner/bookings" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to booking requests
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

          {booking.status === 'pending' && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={handleAccept} loading={submitting}>
                Accept
              </Button>
              <Button variant="secondary" onClick={() => setRejecting((v) => !v)}>
                Reject
              </Button>
            </div>
          )}

          {rejecting && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <label htmlFor="reason" className="text-sm font-medium text-gray-700">
                Reason for declining
              </label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <div className="mt-3 flex gap-2">
                <Button onClick={handleReject} loading={submitting}>
                  Confirm rejection
                </Button>
                <Button variant="secondary" onClick={() => setRejecting(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {booking.status === 'rejected' && booking.cancellationReason && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <strong>Reason given:</strong> {booking.cancellationReason}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Guest</h2>
            <p className="mt-2 text-sm text-gray-700">{booking.user?.name}</p>
            <p className="text-sm text-gray-500">{booking.user?.email}</p>
            <p className="text-sm text-gray-500">{booking.user?.phone || 'No phone on file'}</p>
          </div>

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
              <dt className="text-gray-500">Total</dt>
              <dd className="font-semibold text-brand-600">Rs. {booking.totalPrice.toLocaleString()}</dd>
            </dl>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OwnerBookingDetailsPage;
