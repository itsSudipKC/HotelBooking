import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, size = 16, showValue = true, reviewCount }) => {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            width={size}
            height={size}
            className={
              n <= rounded
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }
          />
        ))}
      </div>
      {showValue && <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>}
      {typeof reviewCount === 'number' && <span className="text-sm text-gray-400">({reviewCount})</span>}
    </div>
  );
};

export default StarRating;
