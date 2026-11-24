import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Users, CalendarCheck, Calendar, CheckCircle2 } from 'lucide-react';
import ImageGallery from '../../components/ImageGallery';
import StarRating from '../../components/StarRating';
import ReviewCard from '../../components/ReviewCard';
import HotelCard from '../../components/HotelCard';
import HotelChatWidget from '../../components/HotelChatWidget';
import MapEmbed from '../../components/MapEmbed';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import RoomDetailsModal from '../../components/RoomDetailsModal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getHotelById, getSimilarHotels, listHotelReviews } from '../../services/hotelService';
import { getWishlistStatus, toggleWishlist } from '../../services/wishlistService';

const todayIso = () => new Date().toISOString().slice(0, 10);
const addDaysIso = (iso, days) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const HotelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { session, isAuthenticated } = useAuth('user');

  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [checkIn, setCheckIn] = useState(todayIso());
  const [checkOut, setCheckOut] = useState(addDaysIso(todayIso(), 1));
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const [showFullyBooked, setShowFullyBooked] = useState(false);

  const handleCheckInChange = (val) => {
    setCheckIn(val);
    if (new Date(checkOut) <= new Date(val)) {
      setCheckOut(addDaysIso(val, 1));
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);

    Promise.all([getHotelById(id, { checkIn, checkOut }), listHotelReviews(id), getSimilarHotels(id)])
      .then(([hotelRes, reviewsRes, similarRes]) => {
        if (!active) return;
        setData(hotelRes.data);
        setReviews(reviewsRes.data.reviews);
        setSimilar(similarRes.data.hotels);
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!data) return;
    const cIn = new Date(checkIn);
    const cOut = new Date(checkOut);
    if (isNaN(cIn.getTime()) || isNaN(cOut.getTime()) || cOut <= cIn) {
      return;
    }

    let active = true;
    setUpdatingAvailability(true);

    getHotelById(id, { checkIn, checkOut })
      .then((res) => {
        if (!active) return;
        setData((prev) => (prev ? { ...prev, rooms: res.data.rooms } : res.data));
      })
      .catch(() => {})
      .finally(() => active && setUpdatingAvailability(false));

    return () => {
      active = false;
    };
  }, [id, checkIn, checkOut]);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlisted(false);
      return;
    }
    getWishlistStatus(session.accessToken, id)
      .then((res) => setWishlisted(res.data.wishlisted))
      .catch(() => {});
  }, [isAuthenticated, session?.accessToken, id]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in or create an account to save hotels.');
      navigate('/user/login', { state: { from: `/hotels/${id}` } });
      return;
    }
    try {
      const res = await toggleWishlist(session.accessToken, id);
      setWishlisted(res.data.wishlisted);
      toast.info(res.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong.');
    }
  };

  const handleBookNow = (roomId, customCheckIn, customCheckOut) => {
    const cIn = customCheckIn || checkIn;
    const cOut = customCheckOut || checkOut;
    let bookingUrl = `/user/bookings/new?hotelId=${id}&roomId=${roomId}&checkIn=${cIn}&checkOut=${cOut}`;

    if (!isAuthenticated) {
      toast.info('Please sign in or create an account to book a room.');
      navigate('/user/login', { state: { from: bookingUrl } });
      return;
    }
    navigate(bookingUrl);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-medium text-gray-900">Hotel not found</p>
        <p className="mt-2 text-sm text-gray-500">It may have been removed or is pending approval.</p>
      </div>
    );
  }

  const { hotel, rooms } = data;
  const visibleRooms = showFullyBooked ? rooms : rooms.filter((r) => r.availableCount > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{hotel.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <StarRating rating={hotel.avgRating || 0} reviewCount={hotel.reviewCount} />
            <p className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {hotel.address?.street ? `${hotel.address.street}, ` : ''}
              {hotel.address?.city}, {hotel.address?.country}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-brand-500"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-brand-600 text-brand-600' : 'text-gray-400'}`} />
          {wishlisted ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="mt-6">
        <ImageGallery images={hotel.images} alt={hotel.name} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">About this hotel</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">{hotel.description}</p>
          </section>

          {hotel.amenities?.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {hotel.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-brand-600" />
                  Available Rooms & Date Selection
                </h2>
                <p className="text-xs text-gray-500">Showing rooms available for your selected dates</p>
              </div>

              {/* Date Selector Bar */}
              <div className="flex flex-wrap items-center gap-3 bg-brand-50/50 p-2.5 rounded-xl border border-brand-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-brand-600" />
                  <span className="text-xs font-medium text-gray-600">Check-in:</span>
                  <input
                    type="date"
                    min={todayIso()}
                    value={checkIn}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-600">Check-out:</span>
                  <input
                    type="date"
                    min={addDaysIso(checkIn, 1)}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer ml-1">
                  <input
                    type="checkbox"
                    checked={showFullyBooked}
                    onChange={(e) => setShowFullyBooked(e.target.checked)}
                    className="rounded text-brand-600"
                  />
                  Show booked rooms
                </label>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {updatingAvailability && (
                <div className="text-center py-2 text-xs text-brand-600 font-medium animate-pulse">
                  Updating live availability for selected dates...
                </div>
              )}

              {rooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => setSelectedRoom(room)}
                  className="group cursor-pointer flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-400 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex gap-4">
                    {room.images?.[0]?.url && (
                      <img src={room.images[0].url} alt={room.type} className="h-24 w-32 rounded-lg object-cover group-hover:opacity-95 transition" />
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition flex items-center gap-2">
                          {room.type}
                          <span className="text-xs font-normal text-gray-400">(Click for details)</span>
                        </p>
                        {room.availableCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            This room is available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                            Fully Booked for Selected Dates
                          </span>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-3.5 w-3.5" /> Up to {room.capacity} guests
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                          Total: {room.totalRooms || 1}
                        </span>
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                          Booked: {room.bookedCount || 0}
                        </span>
                        <span className={`rounded-md px-2 py-0.5 font-semibold ${room.availableCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          Available: {room.availableCount !== undefined ? room.availableCount : Math.max(0, (room.totalRooms || 1) - (room.bookedCount || 0))}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-brand-600">Rs. {room.price.toLocaleString()}/night</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="secondary" onClick={() => setSelectedRoom(room)}>
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleBookNow(room._id, checkIn, checkOut)}
                      disabled={room.availableCount === 0}
                    >
                      {room.availableCount === 0 ? 'Fully Booked' : 'Book Now'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Reviews {hotel.reviewCount ? `(${hotel.reviewCount})` : ''}
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              ) : (
                reviews.map((review) => <ReviewCard key={review._id} review={review} />)
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">Location</h2>
            <div className="mt-4">
              <MapEmbed
                address={`${hotel.name}, ${hotel.address?.city}, ${hotel.address?.country}`}
              />
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-900">Hosted by</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {hotel.owner?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <p className="text-sm text-gray-700">{hotel.owner?.name || 'Hotel Partner'}</p>
          </div>
          <HotelChatWidget hotelId={hotel._id} hotelName={hotel.name} />
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold text-gray-900">Similar Hotels</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((h) => (
              <HotelCard key={h._id} hotel={h} />
            ))}
          </div>
        </section>
      )}

      {selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          hotel={hotel}
          onClose={() => setSelectedRoom(null)}
          onBookNow={handleBookNow}
        />
      )}
    </div>
  );
};

export default HotelDetailsPage;
