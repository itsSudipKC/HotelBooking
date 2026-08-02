const TextField = ({ label, error, id, ...inputProps }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <input
      id={id}
      className={`rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:text-gray-100 ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
      }`}
      {...inputProps}
    />
    {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
  </div>
);

export default TextField;
