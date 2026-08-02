const AMENITIES = ['WiFi', 'Parking', 'Swimming Pool', 'Restaurant', 'Gym', 'Room Service', 'Spa', 'Air Conditioning'];
const RATINGS = [5, 4, 3, 2, 1];

const FilterSidebar = ({ filters, onChange }) => {
  const toggleAmenity = (amenity) => {
    const next = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ ...filters, amenities: next });
  };

  return (
    <aside className="flex h-fit flex-col gap-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Price range (per night)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Star rating</h3>
        <div className="flex flex-col gap-2">
          {RATINGS.map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="radio"
                name="rating"
                checked={String(filters.rating) === String(r)}
                onChange={() => onChange({ ...filters, rating: r })}
              />
              {r}+ stars
            </label>
          ))}
          {filters.rating && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, rating: '' })}
              className="text-left text-xs text-brand-600 hover:underline"
            >
              Clear rating
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Amenities</h3>
        <div className="flex flex-col gap-2">
          {AMENITIES.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" checked={filters.amenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} />
              {amenity}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
