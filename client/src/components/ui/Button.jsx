import { cn } from "../../../utils/cn";

const Button = ({
  type = 'button',
  children,
  variant = 'primary',
  className = '',
  loading = false,
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md px-4 py-2 font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-grayDark active:bg-secondary',
    secondary: 'bg-secondary text-white hover:bg-grayDark active:bg-primary',
    outline: 'border border-primary text-primary bg-white hover:bg-primary hover:text-white',
  };
  return (
    <button
      type={type}
      className={cn(baseClasses, variantClasses[variant], className)}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin mr-2 h-4 w-4 text-inherit" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button; 