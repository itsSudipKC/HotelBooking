import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Users, CheckCircle2 } from 'lucide-react';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { useUserSession } from '../../hooks/useUserSession';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getHotelById } from '../../services/hotelService';
import { createBooking } from '../../services/bookingService';

const TAX_RATE = 0.13;
const todayIso = () => new Date().toISOString().slice(0, 10);
const addDaysIso = (iso, days) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const NewBookingPage = () => {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId');
  const roomId = searchParams.get('roomId');
  const navigate = useNavigate();
  const { account, accessToken, toast, handleLogout } = useUserSession();

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const paramCheckIn = searchParams.get('checkIn');
  const paramCheckOut = searchParams.get('checkOut');

  const [checkIn, setCheckIn] = useState(paramCheckIn || todayIso());
  const [checkOut, setCheckOut] = useState(paramCheckOut || addDaysIso(paramCheckIn || todayIso(), 1));
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    if (!hotelId || !roomId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    getHotelById(hotelId, { checkIn, checkOut })
      .then((res) => {
        const foundRoom = res.data.rooms.find((r) => r._id === roomId);
        if (!foundRoom) {
          setNotFound(true);
          return;
        }
        setHotel(res.data.hotel);
        setRoom(foundRoom);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [hotelId, roomId, checkIn, checkOut]);

  const nights = useMemo(() => {
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return Number.isFinite(diff) && diff > 0 ? Math.round(diff) : 0;
  }, [checkIn, checkOut]);

  const roomPrice = room ? room.price * nights : 0;
  const taxes = Math.round(roomPrice * TAX_RATE);
  const totalPrice = roomPrice + taxes;

  const totalRooms = room?.totalRooms || 1;
  const bookedRooms = room?.bookedCount !== undefined ? room.bookedCount : 0;
  const availableRooms = room?.availableCount !== undefined ? room.availableCount : Math.max(0, totalRooms - bookedRooms);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nights <= 0) {
      toast.error('Check-out date must be after check-in date.');
      return;
    }
    if (availableRooms <= 0) {
      toast.error('the room is not available for this time you can try to book another room or another date');
      return;
    }
    setSubmitting(true);
    try {
      await createBooking(accessToken, { roomId, checkIn, checkOut, guests: Number(guests) });
      toast.success('Booking request submitted — the owner will confirm it shortly.');
      navigate('/user/bookings');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (notFound || !hotel || !room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Room not found</h1>
        <p className="text-sm text-gray-500">This room may no longer be available.</p>
        <Link to="/hotels" className="text-sm font-medium text-brand-600 hover:underline">
          Browse hotels
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-lg font-semibold text-brand-600">
            StayNepal
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-gray-900">{account?.name}</p>
            <button type="button" onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:underline">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link to={`/hotels/${hotelId}`} className="text-sm font-medium text-brand-600 hover:underline">
          ← Back to {hotel.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Request to book</h1>

        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_280px]">
          <form className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6" onSubmit={handleSubmit}>
            <div>
              <h2 className="font-medium text-gray-900">{hotel.name}</h2>
              <p className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" /> {hotel.address?.city}, {hotel.address?.country}
              </p>
              <p className="mt-2 text-sm text-gray-700">
                {room.type} · Rs. {room.price.toLocaleString()}/night
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="checkIn" className="text-sm font-medium text-gray-700">
                  Check-in
                </label>
                <input
                  id="checkIn"
                  type="date"
                  min={todayIso()}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="checkOut" className="text-sm font-medium text-gray-700">
                  Check-out
                </label>
                <input
                  id="checkOut"
                  type="date"
                  min={addDaysIso(checkIn, 1)}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            {/* Room Availability Status for Chosen Dates */}
            <div className={`rounded-xl border p-4 space-y-2 ${availableRooms > 0 ? 'bg-emerald-50/80 border-emerald-200' : 'bg-red-50/60 border-red-200'}`}>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-gray-700 font-semibold">Live Availability for Selected Dates:</span>
                <span className={`font-bold ${availableRooms > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {availableRooms > 0 ? `${availableRooms} of ${totalRooms} rooms available` : 'Fully Booked'}
                </span>
              </div>
              {availableRooms > 0 ? (
                <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  This room is available for your selected dates!
                </p>
              ) : (
                <p className="text-xs font-medium text-red-700 mt-1">
                  ⚠️ the room is not available for this time you can try to book another room or another date
                </p>
              )}
              <div className="flex gap-4 text-xs text-gray-600 pt-1 border-t border-emerald-100">
                <span>Total: <strong className="text-gray-900">{totalRooms}</strong></span>
                <span>Booked: <strong className="text-amber-700">{bookedRooms}</strong></span>
                <span>Available: <strong className={availableRooms > 0 ? 'text-emerald-700' : 'text-red-700'}>{availableRooms}</strong></span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="guests" className="text-sm font-medium text-gray-700">
                Guests
              </label>
              <input
                id="guests"
                type="number"
                min="1"
                max={room.capacity}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                required
                className="w-32 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <p className="flex items-center gap-1 text-xs text-gray-400">
                <Users className="h-3.5 w-3.5" /> Up to {room.capacity} guests for this room
              </p>
            </div>

            <Button type="submit" loading={submitting} disabled={nights <= 0 || availableRooms <= 0}>
              {availableRooms <= 0 ? 'Not Available for Dates' : 'Request to book'}
            </Button>
            <p className="text-xs text-gray-400">
              This sends a request to the hotel — you&apos;ll be notified once they confirm or decline it.
            </p>
          </form>

          <div className="h-fit rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">Price details</h3>
            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>
                  Rs. {room.price.toLocaleString()} × {nights} night{nights === 1 ? '' : 's'}
                </span>
                <span>Rs. {roomPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (13%)</span>
                <span>Rs. {taxes.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
                <span>Total</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBookingPage;
