const Button = ({ children, loading = false, variant = 'primary', className = '', disabled, ...props }) => {
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white disabled:bg-brand-300',
    secondary:
      'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
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
