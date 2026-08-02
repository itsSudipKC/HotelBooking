import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import FilterSidebar from '../../components/FilterSidebar';
import HotelCard from '../../components/HotelCard';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import { listHotels } from '../../services/hotelService';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const emptyResult = { hotels: [], pagination: { page: 1, totalPages: 1, total: 0 } };

const HotelsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState(emptyResult);
  const [loading, setLoading] = useState(true);

  const filters = {
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    amenities: searchParams.get('amenities') ? searchParams.get('amenities').split(',') : [],
  };
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    let active = true;
    setLoading(true);

    const params = {
      page,
      sort,
      ...(filters.search && { search: filters.search }),
      ...(filters.city && { city: filters.city }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.rating && { rating: filters.rating }),
      ...(filters.amenities.length && { amenities: filters.amenities.join(',') }),
    };

    listHotels(params)
      .then((res) => active && setResult(res.data))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateFilters = (nextFilters) => {
    const params = new URLSearchParams();
    if (nextFilters.search) params.set('search', nextFilters.search);
    if (nextFilters.city) params.set('city', nextFilters.city);
    if (nextFilters.minPrice) params.set('minPrice', nextFilters.minPrice);
    if (nextFilters.maxPrice) params.set('maxPrice', nextFilters.maxPrice);
    if (nextFilters.rating) params.set('rating', nextFilters.rating);
    if (nextFilters.amenities.length) params.set('amenities', nextFilters.amenities.join(','));
    params.set('sort', sort);
    setSearchParams(params);
  };

  const updateSort = (nextSort) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', nextSort);
    params.delete('page');
    setSearchParams(params);
  };

  const updatePage = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', nextPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {filters.city ? `Hotels in ${filters.city}` : 'All Hotels'}
      </h1>

      <div className="mt-6">
        <SearchBar initialValue={filters.search} onSearch={(search) => updateFilters({ ...filters, search })} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <FilterSidebar filters={filters} onChange={updateFilters} />

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? 'Searching...' : `${result.pagination.total} hotels found`}
            </p>
            <select
              value={sort}
              onChange={(e) => updateSort(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : result.hotels.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
              No hotels match your search. Try adjusting your filters.
            </p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {result.hotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          )}

          <div className="mt-10">
            <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} onPageChange={updatePage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelsPage;
