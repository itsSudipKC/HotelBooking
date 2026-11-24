import { useState, useMemo } from 'react';
import { X, Users, DoorOpen, CalendarCheck, CheckCircle2, AlertCircle, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Info } from 'lucide-react';
import Button from './Button';

const TAX_RATE = 0.13;
const todayIso = () => new Date().toISOString().slice(0, 10);
const addDaysIso = (iso, days) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const RoomDetailsModal = ({ room, hotel, onClose, onBookNow }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState(todayIso());
  const [checkOut, setCheckOut] = useState(addDaysIso(todayIso(), 1));

  if (!room) return null;

  const images = room.images?.length > 0 ? room.images : [{ url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', publicId: 'placeholder' }];
  const currentImage = images[selectedImageIndex]?.url || images[0]?.url;

  const nights = useMemo(() => {
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return Number.isFinite(diff) && diff > 0 ? Math.round(diff) : 0;
  }, [checkIn, checkOut]);

  const roomPrice = room.price * (nights || 1);
  const taxes = Math.round(roomPrice * TAX_RATE);
  const totalPrice = roomPrice + taxes;

  const totalRooms = room.totalRooms || 1;
  const bookedRooms = room.bookedCount !== undefined ? room.bookedCount : 0;
  const availableRooms = room.availableCount !== undefined ? room.availableCount : Math.max(0, totalRooms - bookedRooms);

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBook = () => {
    if (onBookNow) {
      onBookNow(room._id, checkIn, checkOut);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100 my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{room.type}</h2>
            <p className="text-xs text-gray-500">{hotel?.name || 'Hotel Room Details'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Main Image Banner with Gallery Navigation */}
          <div className="relative group h-64 sm:h-80 w-full overflow-hidden rounded-xl bg-gray-100">
            <img
              src={currentImage}
              alt={room.type}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/70 backdrop-blur transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/70 backdrop-blur transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        idx === selectedImageIndex ? 'w-5 bg-white' : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute top-3 right-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-brand-700 shadow backdrop-blur">
              Rs. {room.price.toLocaleString()} <span className="text-xs font-normal text-gray-500">/ night</span>
            </div>
          </div>

          {/* Room Availability & Details Stat Badges */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Room Information & Availability</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 text-center">
                <DoorOpen className="h-5 w-5 mx-auto text-brand-600 mb-1" />
                <p className="text-xs text-gray-500">Total Rooms</p>
                <p className="text-lg font-bold text-gray-900">{totalRooms}</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5 text-center">
                <CalendarCheck className="h-5 w-5 mx-auto text-amber-600 mb-1" />
                <p className="text-xs text-amber-700">Booked Rooms</p>
                <p className="text-lg font-bold text-amber-900">{bookedRooms}</p>
              </div>
              <div className={`rounded-xl border p-3.5 text-center ${availableRooms > 0 ? 'border-emerald-100 bg-emerald-50/60' : 'border-red-100 bg-red-50/60'}`}>
                <CheckCircle2 className={`h-5 w-5 mx-auto mb-1 ${availableRooms > 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                <p className={`text-xs ${availableRooms > 0 ? 'text-emerald-700' : 'text-red-700'}`}>Available Rooms</p>
                <p className={`text-lg font-bold ${availableRooms > 0 ? 'text-emerald-900' : 'text-red-900'}`}>{availableRooms}</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-center">
                <Users className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <p className="text-xs text-blue-700">Max Capacity</p>
                <p className="text-lg font-bold text-blue-900">{room.capacity} Guests</p>
              </div>
            </div>
          </div>

          {/* Interactive Date & Price Estimator */}
          <div className="rounded-xl border border-brand-100 bg-brand-50/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-brand-900">
                <Sparkles className="h-4 w-4 text-brand-600" /> Select Stay Dates
              </span>
              <span className="text-xs font-medium text-brand-700">
                {nights} night{nights === 1 ? '' : 's'} stay
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="modalCheckIn" className="block text-xs font-medium text-gray-700 mb-1">Check-in Date</label>
                <input
                  id="modalCheckIn"
                  type="date"
                  min={todayIso()}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label htmlFor="modalCheckOut" className="block text-xs font-medium text-gray-700 mb-1">Check-out Date</label>
                <input
                  id="modalCheckOut"
                  type="date"
                  min={addDaysIso(checkIn, 1)}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            {/* Availability Alert Banner */}
            {availableRooms > 0 ? (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-100/80 px-3 py-2 rounded-lg">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                This room is available! {availableRooms} room{availableRooms === 1 ? '' : 's'} remaining for your dates.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-100/80 px-3 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                This room is currently fully booked for these dates. You can try selecting another date range or room type.
              </div>
            )}
          </div>

          {/* Amenities Section */}
          {room.amenities?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Room Amenities & Features</h3>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Policy / Description note */}
          <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 flex items-start gap-2">
            <Info className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
            <span>
              Booking requests are instantly transmitted to the hotel owner. Confirmation notifications will be delivered to your account dashboard.
            </span>
          </div>
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="sticky bottom-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100 bg-white px-6 py-4">
          <div>
            <p className="text-xs text-gray-500">Total Price ({nights} night{nights === 1 ? '' : 's'} + taxes)</p>
            <p className="text-xl font-extrabold text-brand-700">Rs. {totalPrice.toLocaleString()}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleBook} disabled={nights <= 0 || availableRooms === 0}>
              Request to Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsModal;
