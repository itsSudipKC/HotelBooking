import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/dashboard/Badge';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useAdminSession } from '../../hooks/useAdminSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import * as adminOwnerService from '../../services/adminOwnerService';

const emptyResult = { owners: [], pagination: { page: 1, totalPages: 1, total: 0 } };

const OwnerManagementPage = () => {
  const { account, accessToken, toast, handleLogout } = useAdminSession();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(emptyResult);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    adminOwnerService
      .listOwners(accessToken, { search: search || undefined, status: status || undefined, page })
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

  const runAction = async (action, id, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    try {
      await action(accessToken, id);
      toast.success('Done.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout role="admin" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/admin/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to dashboard
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Hotel Owners</h1>
        <Link to="/admin/owners/add">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Owner
          </Button>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, or business..."
              className="w-64 text-sm outline-none"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : result.owners.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">No hotel owners found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Hotels</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.owners.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{o.name}</td>
                  <td className="px-4 py-3 text-gray-500">{o.businessName || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{o.email}</td>
                  <td className="px-4 py-3 text-gray-500">{o.hotelCount}</td>
                  <td className="px-4 py-3">
                    <Badge value={o.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                      <Link to={`/admin/owners/${o._id}`} className="text-brand-600 hover:underline">
                        View
                      </Link>
                      {o.status === 'active' ? (
                        <button
                          type="button"
                          onClick={() => runAction(adminOwnerService.suspendOwner, o._id)}
                          className="text-amber-600 hover:underline"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => runAction(adminOwnerService.activateOwner, o._id)}
                          className="text-emerald-600 hover:underline"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          runAction(adminOwnerService.deleteOwner, o._id, `Delete ${o.name}? This cannot be undone.`)
                        }
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
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

export default OwnerManagementPage;
