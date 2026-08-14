'use client';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-sigo-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary: 'bg-sigo-primary text-white hover:bg-sigo-primary-light hover:-translate-y-px hover:shadow-lg hover:shadow-sigo-primary/30',
      secondary: 'bg-card text-primary border border-default hover:border-sigo-primary hover:text-sigo-primary',
      danger: 'bg-sigo-error text-white hover:brightness-90',
      success: 'bg-sigo-success text-white hover:brightness-90',
      ghost: 'text-secondary hover:text-primary hover:bg-app',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
