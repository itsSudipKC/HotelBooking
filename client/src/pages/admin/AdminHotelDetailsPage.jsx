import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/dashboard/Badge';
import ImageGallery from '../../components/ImageGallery';
import StarRating from '../../components/StarRating';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useAdminSession } from '../../hooks/useAdminSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import * as adminHotelService from '../../services/adminHotelService';

const AdminHotelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, accessToken, toast, handleLogout } = useAdminSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    adminHotelService
      .getHotelById(accessToken, id)
      .then((res) => setData(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [accessToken, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await adminHotelService.approveHotel(accessToken, id);
      toast.success('Hotel approved.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for rejecting this hotel.');
      return;
    }
    setSubmitting(true);
    try {
      await adminHotelService.rejectHotel(accessToken, id, reason.trim());
      toast.success('Hotel rejected.');
      setRejecting(false);
      setReason('');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${data.hotel.name}"? This also removes its rooms and reviews.`)) return;
    try {
      await adminHotelService.deleteHotel(accessToken, id);
      toast.success('Hotel deleted.');
      navigate('/admin/hotels');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout role="admin" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/admin/hotels" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to hotels
      </Link>

      {loading || !data ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{data.hotel.name}</h1>
                <Badge value={data.hotel.status} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <StarRating rating={data.hotel.avgRating || 0} reviewCount={data.hotel.reviewCount} />
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  {data.hotel.address?.city}, {data.hotel.address?.country}
                </p>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Owner: {data.hotel.owner?.name} ({data.hotel.owner?.email})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.hotel.status !== 'approved' && (
                <Button onClick={handleApprove} loading={submitting}>
                  Approve
                </Button>
              )}
              {data.hotel.status !== 'rejected' && (
                <Button variant="secondary" onClick={() => setRejecting((v) => !v)}>
                  Reject
                </Button>
              )}
              <Button variant="secondary" className="text-red-600" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>

          {rejecting && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <label htmlFor="reason" className="text-sm font-medium text-gray-700">
                Rejection reason
              </label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Hotel images do not provide sufficient information about the property."
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

          {data.hotel.status === 'rejected' && data.hotel.rejectionReason && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <strong>Rejection reason:</strong> {data.hotel.rejectionReason}
            </div>
          )}

          <div className="mt-6">
            <ImageGallery images={data.hotel.images} alt={data.hotel.name} />
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-8">
              <section>
                <h2 className="text-lg font-semibold text-gray-900">About</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{data.hotel.description}</p>
              </section>

              {data.hotel.amenities?.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.hotel.amenities.map((a) => (
                      <span key={a} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {a}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-lg font-semibold text-gray-900">Rooms ({data.rooms.length})</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {data.rooms.length === 0 ? (
                    <p className="text-sm text-gray-500">No rooms added yet.</p>
                  ) : (
                    data.rooms.map((room) => (
                      <div
                        key={room._id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{room.type}</p>
                          <p className="flex items-center gap-1 text-gray-500">
                            <Users className="h-3.5 w-3.5" /> Up to {room.capacity} guests · {room.totalRooms} rooms
                          </p>
                        </div>
                        <p className="font-semibold text-brand-600">Rs. {room.price.toLocaleString()}/night</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <aside className="h-fit rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-900">Hotel Owner</p>
              <p className="mt-2 text-sm text-gray-600">{data.hotel.owner?.name}</p>
              <p className="text-sm text-gray-500">{data.hotel.owner?.email}</p>
              <p className="text-sm text-gray-500">{data.hotel.owner?.phone || 'No phone on file'}</p>
              <Link
                to={`/admin/owners/${data.hotel.owner?._id}`}
                className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
              >
                View owner profile →
              </Link>
            </aside>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminHotelDetailsPage;
