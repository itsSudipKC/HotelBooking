import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import StarRating from './StarRating';

const HotelCard = ({ hotel, linkTo }) => {
  const image = hotel.images?.[0]?.url;

  return (
    <Link
      to={linkTo || `/hotels/${hotel._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
        {image && (
          <img
            src={image}
            alt={hotel.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        {typeof hotel.matchScore === 'number' && (
          <span className="absolute right-2 top-2 rounded-full bg-brand-600 px-2 py-1 text-xs font-semibold text-white shadow-sm">
            {Math.round(hotel.matchScore * 100)}% match
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
          {hotel.startingPrice != null && (
            <p className="whitespace-nowrap text-sm font-semibold text-brand-600">
              Rs. {hotel.startingPrice.toLocaleString()}
              <span className="font-normal text-gray-400">/night</span>
            </p>
          )}
        </div>
        <p className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-4 w-4" /> {hotel.address?.city}, {hotel.address?.country}
        </p>
        <StarRating rating={hotel.avgRating || 0} reviewCount={hotel.reviewCount} size={14} />
      </div>
    </Link>
  );
};

export default HotelCard;
