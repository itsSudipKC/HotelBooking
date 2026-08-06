import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useUserSession } from '../../hooks/useUserSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getPaymentForBooking } from '../../services/paymentService';

// Reached via the backend's post-verification redirect after eSewa/Khalti.
// The URL's own `status` param is only used for the initial spinner state —
// the real, trusted status is whatever the backend recorded server-side.
const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { account, accessToken, toast, handleLogout } = useUserSession();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !bookingId) {
      setLoading(false);
      return;
    }
    getPaymentForBooking(accessToken, bookingId)
      .then((res) => setPayment(res.data.payment))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, bookingId]);

  const success = payment?.status === 'success';

  return (
    <DashboardLayout role="user" accountName={account?.name} onLogout={handleLogout}>
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="mx-auto mt-10 max-w-md text-center">
          {success ? (
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          ) : (
            <XCircle className="mx-auto h-14 w-14 text-red-500" />
          )}
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">{success ? 'Payment successful' : 'Payment failed'}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {success
              ? 'Your payment has been received and your booking is fully confirmed.'
              : "We couldn't confirm this payment. No charge was recorded — you can try again from your booking."}
          </p>
          {bookingId && (
            <Link to={`/user/bookings/${bookingId}`}>
              <Button className="mt-6">Back to booking</Button>
            </Link>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PaymentResultPage;
