import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import HotelCard from '../../components/HotelCard';
import Spinner from '../../components/Spinner';
import { useUserSession } from '../../hooks/useUserSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { listMyWishlist, toggleWishlist } from '../../services/wishlistService';

const WishlistPage = () => {
  const { account, accessToken, toast, handleLogout } = useUserSession();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    listMyWishlist(accessToken)
      .then((res) => setHotels(res.data.hotels))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const handleRemove = async (hotelId) => {
    try {
      await toggleWishlist(accessToken, hotelId);
      setHotels((prev) => prev.filter((h) => h._id !== hotelId));
      toast.info('Removed from wishlist.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout role="user" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/user/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">Wishlist</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : hotels.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Heart className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-4 font-medium text-gray-900">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-gray-500">
            <Link to="/hotels" className="text-brand-600 hover:underline">
              Browse hotels
            </Link>{' '}
            and tap the heart on one you like.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <div key={hotel._id} className="relative">
              <button
                type="button"
                onClick={() => handleRemove(hotel._id)}
                className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-gray-500 shadow hover:text-red-600"
                aria-label="Remove from wishlist"
              >
                <X className="h-4 w-4" />
              </button>
              <HotelCard hotel={hotel} />
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default WishlistPage;
