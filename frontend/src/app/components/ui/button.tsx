import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    loading = false,
    icon,
    children,
    disabled,
    className = '',
    ...props 
  }, ref) => {
    const variantClasses = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
      ghost: 'text-primary-500 hover:bg-primary-50 active:bg-primary-100',
      danger: 'bg-error text-white hover:bg-red-600 active:bg-red-700',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm rounded-xs',
      md: 'px-4 py-2.5 text-base rounded-sm',
      lg: 'px-6 py-3 text-lg rounded-md',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          font-medium rounded-md transition-all duration-200
          disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading && <span className="animate-spin">⟳</span>}
        {icon && !loading && icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';