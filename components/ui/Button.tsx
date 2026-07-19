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
    const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary: 'bg-brand-600 text-white hover:bg-brand-700 hover:-translate-y-px hover:shadow-lg hover:shadow-brand-600/30',
      secondary: 'bg-card text-primary border border-default hover:border-brand-600 hover:text-brand-600',
      danger: 'bg-red-500 text-white hover:bg-red-600',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600',
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
