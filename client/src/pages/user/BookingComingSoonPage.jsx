import { Link, useSearchParams } from 'react-router-dom';

const BookingComingSoonPage = () => {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center dark:bg-gray-950">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Booking flow coming soon</h1>
      <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
        We&apos;re putting the finishing touches on the booking and payment experience. Check back soon to complete
        your reservation.
      </p>
      {hotelId && (
        <Link to={`/hotels/${hotelId}`} className="text-sm font-medium text-brand-600 hover:underline">
          Back to hotel details
        </Link>
      )}
      <Link to="/hotels" className="text-sm font-medium text-brand-600 hover:underline">
        Browse hotels
      </Link>
    </div>
  );
};

export default BookingComingSoonPage;
