import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Users } from 'lucide-react';
import ImageGallery from '../../components/ImageGallery';
import StarRating from '../../components/StarRating';
import ReviewCard from '../../components/ReviewCard';
import HotelCard from '../../components/HotelCard';
import MapEmbed from '../../components/MapEmbed';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getHotelById, getSimilarHotels, listHotelReviews } from '../../services/hotelService';
import { getWishlistStatus, toggleWishlist } from '../../services/wishlistService';

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

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);

    Promise.all([getHotelById(id), listHotelReviews(id), getSimilarHotels(id)])
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

  const handleBookNow = (roomId) => {
    const bookingUrl = `/user/bookings/new?hotelId=${id}&roomId=${roomId}`;
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
            <h2 className="text-lg font-semibold text-gray-900">Available Rooms</h2>
            <div className="mt-4 flex flex-col gap-4">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex gap-4">
                    {room.images?.[0]?.url && (
                      <img src={room.images[0].url} alt={room.type} className="h-20 w-28 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{room.type}</p>
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="h-4 w-4" /> Up to {room.capacity} guests
                      </p>
                      <p className="mt-1 text-sm font-semibold text-brand-600">Rs. {room.price.toLocaleString()}/night</p>
                    </div>
                  </div>
                  <Button onClick={() => handleBookNow(room._id)}>Book Now</Button>
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
                lat={hotel.location?.lat}
                lng={hotel.location?.lng}
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
    </div>
  );
};

export default HotelDetailsPage;
