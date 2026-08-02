import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import HotelCard from '../../components/HotelCard';
import Testimonials from '../../components/Testimonials';
import WhyChooseUs from '../../components/WhyChooseUs';
import Spinner from '../../components/Spinner';
import { getFeaturedHotels } from '../../services/hotelService';

const DESTINATIONS = [
  { city: 'Kathmandu', image: 'https://picsum.photos/seed/dest-kathmandu/600/750' },
  { city: 'Pokhara', image: 'https://picsum.photos/seed/dest-pokhara/600/750' },
  { city: 'Chitwan', image: 'https://picsum.photos/seed/dest-chitwan/600/750' },
  { city: 'Bhaktapur', image: 'https://picsum.photos/seed/dest-bhaktapur/600/750' },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getFeaturedHotels(8)
      .then((res) => {
        if (active) setFeatured(res.data.hotels);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-700 to-brand-600 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Find your next stay, hassle-free</h1>
          <p className="mt-4 text-brand-100">Search hundreds of verified hotels across Nepal and book in minutes.</p>
          <div className="mt-8">
            <SearchBar large />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Featured Hotels</h2>
          <Link to="/hotels" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Popular Destinations</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DESTINATIONS.map((dest) => (
              <Link
                key={dest.city}
                to={`/hotels?city=${encodeURIComponent(dest.city)}`}
                className="group relative aspect-4/5 overflow-hidden rounded-xl"
              >
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-4 left-4 text-lg font-semibold text-white">{dest.city}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-12 text-center text-white sm:px-16">
          <h2 className="text-2xl font-bold sm:text-3xl">Exclusive early-bird offers</h2>
          <p className="mt-3 text-amber-50">
            Save up to 20% when you book two weeks in advance. Discounts applied automatically at checkout.
          </p>
          <Link
            to="/hotels"
            className="mt-6 inline-block rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-50"
          >
            Browse deals
          </Link>
        </div>
      </section>

      <Testimonials />
      <WhyChooseUs />
    </div>
  );
};

export default HomePage;
