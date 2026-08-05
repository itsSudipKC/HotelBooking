import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarRange } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/dashboard/Badge';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import { useAdminSession } from '../../hooks/useAdminSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { listBookings } from '../../services/adminBookingService';

const STATUSES = ['', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

const emptyResult = { bookings: [], pagination: { page: 1, totalPages: 1, total: 0 } };

const BookingManagementPage = () => {
  const { account, accessToken, toast, handleLogout } = useAdminSession();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(emptyResult);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    listBookings(accessToken, { status: status || undefined, page })
      .then((res) => setResult(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, status, page]);

  return (
    <DashboardLayout role="admin" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/admin/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">Manage Bookings</h1>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
              status === s ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : result.bookings.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <CalendarRange className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-4 font-medium text-gray-900">No bookings yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Bookings will show up here once the guest booking flow lands in a later update.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Hotel</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3">Check-out</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.bookings.map((b) => (
                <tr key={b._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{b.user?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{b.hotel?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-500">Rs. {b.totalPrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge value={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/bookings/${b._id}`} className="text-xs font-medium text-brand-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} onPageChange={setPage} />
      </div>
    </DashboardLayout>
  );
};

export default BookingManagementPage;
