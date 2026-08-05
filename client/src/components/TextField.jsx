const TextField = ({ label, error, id, ...inputProps }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      className={`rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
        error ? 'border-red-500' : 'border-gray-200'
      }`}
      {...inputProps}
    />
    {error && <span className="text-xs text-red-600">{error}</span>}
  </div>
);

export default TextField;
