'use client';
import { cn } from '@/lib/utils';
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';

// ── Input ──────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-secondary">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{leftIcon}</div>
        )}
        <input
          ref={ref}
          className={cn(
            'input-base',
            leftIcon && 'pl-9',
            error && 'border-red-400 focus:border-red-500 focus:shadow-red-100',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// ── Textarea ───────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-secondary">{label}</label>}
      <textarea
        ref={ref}
        className={cn('input-base resize-none', error && 'border-red-400', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

// ── Select ─────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-secondary">{label}</label>}
      <select
        ref={ref}
        className={cn('input-base', error && 'border-red-400', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
