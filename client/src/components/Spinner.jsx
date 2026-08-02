const Spinner = ({ className = '' }) => (
  <div
    role="status"
    aria-label="Loading"
    className={`h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 ${className}`}
  />
);

export default Spinner;
