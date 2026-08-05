const STYLES = {
  approved: 'bg-emerald-100 text-emerald-700',
  active: 'bg-emerald-100 text-emerald-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
};

const Badge = ({ value }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
      STYLES[value] || 'bg-gray-100 text-gray-600'
    }`}
  >
    {value}
  </span>
);

export default Badge;
