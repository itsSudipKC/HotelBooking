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
import * as adminUserService from '../../services/adminUserService';

const emptyResult = { users: [], pagination: { page: 1, totalPages: 1, total: 0 } };

const UserManagementPage = () => {
  const { account, accessToken, toast, handleLogout } = useAdminSession();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(emptyResult);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    adminUserService
      .listUsers(accessToken, { search: search || undefined, status: status || undefined, page })
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
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">Manage Users</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="w-56 text-sm outline-none"
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
      ) : result.users.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">No users found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3">Total Spending</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.bookingCount}</td>
                  <td className="px-4 py-3 text-gray-500">Rs. {u.totalSpent.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge value={u.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                      <Link to={`/admin/users/${u._id}`} className="text-brand-600 hover:underline">
                        View
                      </Link>
                      {u.status === 'active' ? (
                        <button
                          type="button"
                          onClick={() => runAction(adminUserService.suspendUser, u._id)}
                          className="text-amber-600 hover:underline"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => runAction(adminUserService.activateUser, u._id)}
                          className="text-emerald-600 hover:underline"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          runAction(adminUserService.deleteUser, u._id, `Delete ${u.name}? This cannot be undone.`)
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

export default UserManagementPage;
