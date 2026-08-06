import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useUserSession } from '../../hooks/useUserSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getMyBookingById } from '../../services/bookingService';
import { initiatePayment } from '../../services/paymentService';

const submitEsewaForm = (formUrl, fields) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = formUrl;
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
};

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, accessToken, toast, handleLogout } = useUserSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingWith, setPayingWith] = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    getMyBookingById(accessToken, id)
      .then((res) => {
        const b = res.data.booking;
        if (b.status !== 'confirmed' || b.payment?.status === 'success') {
          toast.info('This booking is not awaiting payment.');
          navigate(`/user/bookings/${id}`, { replace: true });
          return;
        }
        setBooking(b);
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
        navigate('/user/bookings', { replace: true });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, id]);

  const pay = async (method) => {
    setPayingWith(method);
    try {
      const res = await initiatePayment(accessToken, { bookingId: id, method });
      if (method === 'esewa') {
        submitEsewaForm(res.data.formUrl, res.data.fields);
      } else {
        window.location.href = res.data.paymentUrl;
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
      setPayingWith(null);
    }
  };

  return (
    <DashboardLayout role="user" accountName={account?.name} onLogout={handleLogout}>
      <Link to={`/user/bookings/${id}`} className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to booking
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">Pay for your booking</h1>

      {loading || !booking ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="mt-6 max-w-md">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{booking.hotel?.name}</p>
            <p className="mt-1 text-sm text-gray-500">Invoice #{booking.invoiceNumber}</p>
            <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-lg font-semibold text-gray-900">
              <span>Amount due</span>
              <span>Rs. {booking.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button loading={payingWith === 'esewa'} disabled={Boolean(payingWith)} onClick={() => pay('esewa')} className="justify-center">
              Pay with eSewa
            </Button>
            <Button
              variant="secondary"
              loading={payingWith === 'khalti'}
              disabled={Boolean(payingWith)}
              onClick={() => pay('khalti')}
              className="justify-center text-purple-700"
            >
              Pay with Khalti
            </Button>
          </div>
          <p className="mt-4 text-xs text-gray-400">You&apos;ll be redirected to your chosen provider to complete the payment securely.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PaymentPage;
