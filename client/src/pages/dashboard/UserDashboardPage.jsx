import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CalendarCheck, Heart, UserCog } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import HotelCard from '../../components/HotelCard';
import Spinner from '../../components/Spinner';
import { useUserSession } from '../../hooks/useUserSession';
import { getRecommendedHotels } from '../../services/hotelService';

const QUICK_LINKS = [
  { icon: Search, label: 'Browse Hotels', to: '/hotels', active: true },
  { icon: CalendarCheck, label: 'My Bookings', to: '/user/bookings', active: true },
  { icon: Heart, label: 'Wishlist', to: '/user/wishlist', active: true },
  { icon: UserCog, label: 'Profile Settings', to: '/user/profile', active: true },
];

const UserDashboardPage = () => {
  const { account, accessToken, handleLogout } = useUserSession();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    getRecommendedHotels(accessToken, 4)
      .then((res) => active && setHotels(res.data.hotels))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [accessToken]);

  return (
    <DashboardLayout role="user" accountName={account?.name} onLogout={handleLogout}>
      <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {account?.name?.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-gray-500">Here&apos;s what&apos;s happening with your account.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              {account?.avatar?.url ? (
                <img src={account.avatar.url} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
                  {account?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{account?.name}</p>
                <p className="text-sm text-gray-500">{account?.email}</p>
              </div>
            </div>
            {account?.phone && <p className="mt-3 text-sm text-gray-500">{account.phone}</p>}
          </div>

          <div className="flex flex-col gap-2">
            {QUICK_LINKS.map(({ icon: Icon, label, to, active }) => {
              const content = (
                <div
                  className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-medium transition ${
                    active
                      ? 'border-gray-200 bg-white text-gray-900 shadow-sm hover:border-brand-500 hover:text-brand-600'
                      : 'border-dashed border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                  {!active && <span className="ml-auto text-xs">Coming soon</span>}
                </div>
              );
              return active ? (
                <Link key={label} to={to}>
                  {content}
                </Link>
              ) : (
                <div key={label}>{content}</div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recommended Hotels</h2>
            <Link to="/hotels" className="text-sm font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {hotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboardPage;
