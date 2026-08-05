import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/dashboard/Badge';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useAdminSession } from '../../hooks/useAdminSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { listHotels } from '../../services/adminHotelService';

const TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const emptyResult = { hotels: [], pagination: { page: 1, totalPages: 1, total: 0 } };

const HotelManagementPage = () => {
  const { account, accessToken, toast, handleLogout } = useAdminSession();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(emptyResult);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    listHotels(accessToken, { search: search || undefined, status: status || undefined, page })
      .then((res) => setResult(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [accessToken, status, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <DashboardLayout role="admin" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/admin/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">Manage Hotels</h1>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                status === tab.value ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hotels..."
              className="w-56 text-sm outline-none"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : result.hotels.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">No hotels found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Hotel</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Rooms</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.hotels.map((h) => (
                <tr key={h._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{h.name}</td>
                  <td className="px-4 py-3 text-gray-500">{h.owner?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {h.address?.city}, {h.address?.country}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{h.avgRating ? h.avgRating.toFixed(1) : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{h.roomCount}</td>
                  <td className="px-4 py-3">
                    <Badge value={h.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/hotels/${h._id}`} className="text-xs font-medium text-brand-600 hover:underline">
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

export default HotelManagementPage;
