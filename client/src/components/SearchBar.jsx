import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchBar = ({ initialValue = '', large = false, onSearch }) => {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();

    if (onSearch) {
      onSearch(trimmed);
      return;
    }

    const params = new URLSearchParams();
    if (trimmed) params.set('search', trimmed);
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm ${large ? 'sm:p-3' : ''}`}
    >
      <Search className="ml-2 h-5 w-5 shrink-0 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by hotel name, city, or country..."
        className="flex-1 bg-transparent px-1 py-2 text-sm text-gray-900 outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
