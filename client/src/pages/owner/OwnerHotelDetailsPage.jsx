import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapPin, Users, Plus, Trash2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/dashboard/Badge';
import ImageGallery from '../../components/ImageGallery';
import StarRating from '../../components/StarRating';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useOwnerSession } from '../../hooks/useOwnerSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import * as ownerHotelService from '../../services/ownerHotelService';
import * as ownerRoomService from '../../services/ownerRoomService';

const OwnerHotelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, accessToken, toast, handleLogout } = useOwnerSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [savingFaqs, setSavingFaqs] = useState(false);

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    ownerHotelService
      .getMyHotelById(accessToken, id)
      .then((res) => {
        setData(res.data);
        setFaqs(res.data.hotel.faqs?.length ? res.data.hotel.faqs : [{ question: '', answer: '' }]);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [accessToken, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFaqField = (index, field, value) => {
    setFaqs((prev) => prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)));
  };

  const addFaqRow = () => setFaqs((prev) => [...prev, { question: '', answer: '' }]);

  const removeFaqRow = (index) => setFaqs((prev) => prev.filter((_, i) => i !== index));

  const handleSaveFaqs = async (e) => {
    e.preventDefault();
    const cleaned = faqs.map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })).filter((f) => f.question && f.answer);
    setSavingFaqs(true);
    try {
      await ownerHotelService.updateHotelFaqs(accessToken, id, cleaned);
      toast.success('Chatbot FAQs updated.');
      setFaqs(cleaned.length ? cleaned : [{ question: '', answer: '' }]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingFaqs(false);
    }
  };

  const handleDeleteHotel = async () => {
    if (!window.confirm(`Delete "${data.hotel.name}"? This also removes its rooms and reviews.`)) return;
    try {
      await ownerHotelService.deleteHotel(accessToken, id);
      toast.success('Hotel deleted.');
      navigate('/owner/hotels');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteRoom = async (roomId, roomType) => {
    if (!window.confirm(`Delete "${roomType}"?`)) return;
    try {
      await ownerRoomService.deleteRoom(accessToken, roomId);
      toast.success('Room deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleToggleRoom = async (roomId) => {
    try {
      await ownerRoomService.toggleRoomActive(accessToken, roomId);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout role="owner" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/owner/hotels" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to my hotels
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
            </div>
            <div className="flex gap-2">
              <Link to={`/owner/hotels/${id}/edit`}>
                <Button variant="secondary">{data.hotel.status === 'rejected' ? 'Edit & Resubmit' : 'Edit'}</Button>
              </Link>
              <Button variant="secondary" className="text-red-600" onClick={handleDeleteHotel}>
                Delete
              </Button>
            </div>
          </div>

          {data.hotel.status === 'rejected' && data.hotel.rejectionReason && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <strong>Rejection reason:</strong> {data.hotel.rejectionReason}
            </div>
          )}
          {data.hotel.status === 'pending' && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              Waiting for admin review. It won&apos;t be visible to guests until approved.
            </div>
          )}

          <div className="mt-6">
            <ImageGallery images={data.hotel.images} alt={data.hotel.name} />
          </div>

          <div className="mt-8 flex flex-col gap-8">
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Rooms ({data.rooms.length})</h2>
                <Link to={`/owner/hotels/${id}/rooms/add`}>
                  <Button variant="secondary" className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Add Room
                  </Button>
                </Link>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {data.rooms.length === 0 ? (
                  <p className="text-sm text-gray-500">No rooms added yet.</p>
                ) : (
                  data.rooms.map((room) => (
                    <div
                      key={room._id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 text-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{room.type}</p>
                          <Badge value={room.isActive ? 'active' : 'suspended'} />
                        </div>
                        <p className="flex items-center gap-1 text-gray-500">
                          <Users className="h-3.5 w-3.5" /> Up to {room.capacity} guests · {room.totalRooms} rooms
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-brand-600">Rs. {room.price.toLocaleString()}/night</p>
                        <button type="button" onClick={() => handleToggleRoom(room._id)} className="text-xs font-medium text-gray-600 hover:underline">
                          {room.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link
                          to={`/owner/rooms/${room._id}/edit`}
                          state={{ room, hotelId: id }}
                          className="text-xs font-medium text-brand-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(room._id, room.type)}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">Reviews ({data.reviews.length})</h2>
              <div className="mt-3 flex flex-col gap-3">
                {data.reviews.length === 0 ? (
                  <p className="text-sm text-gray-500">No reviews yet.</p>
                ) : (
                  data.reviews.map((review) => (
                    <div key={review._id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900">{review.user?.name || 'Guest'}</p>
                        <StarRating rating={review.rating} showValue={false} size={14} />
                      </div>
                      {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">Chatbot FAQs</h2>
              <p className="mt-1 text-sm text-gray-500">
                Answers your hotel&apos;s &quot;Chat With Us&quot; widget uses for guest questions (check-in/out times, parking,
                cancellation policy, etc). Saving these does not affect your listing&apos;s approval status.
              </p>
              <form onSubmit={handleSaveFaqs} className="mt-4 flex flex-col gap-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-medium text-gray-500">Question {index + 1}</label>
                      {faqs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFaqRow(index)}
                          aria-label="Remove FAQ"
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaqField(index, 'question', e.target.value)}
                      placeholder="e.g. What time is check-in?"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => updateFaqField(index, 'answer', e.target.value)}
                      placeholder="e.g. Check-in is available from 2:00 PM."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" className="gap-1.5" onClick={addFaqRow}>
                    <Plus className="h-4 w-4" />
                    Add question
                  </Button>
                  <Button type="submit" loading={savingFaqs}>
                    Save FAQs
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default OwnerHotelDetailsPage;
