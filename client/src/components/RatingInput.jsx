import { useState } from 'react';
import { Star } from 'lucide-react';

const RatingInput = ({ value, onChange, size = 24 }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            width={size}
            height={size}
            className={n <= display ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingInput;
