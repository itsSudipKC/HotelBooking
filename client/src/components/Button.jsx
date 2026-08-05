const Button = ({ children, loading = false, variant = 'primary', className = '', disabled, ...props }) => {
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow disabled:bg-brand-300 disabled:shadow-none',
    secondary:
      'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm hover:shadow',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
};

export default Button;
