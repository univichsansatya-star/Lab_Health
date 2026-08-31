import React from 'react';
import { cn } from '@/src/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'soft-cyan';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm hover:shadow-cyan-500/20 focus:ring-cyan-500 border border-cyan-600',
      secondary:
        'bg-slate-800 hover:bg-slate-900 text-white shadow-sm focus:ring-slate-700 border border-slate-800',
      'soft-cyan':
        'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 focus:ring-cyan-500 border border-cyan-200/80',
      outline:
        'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 focus:ring-cyan-500 shadow-2xs',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-400',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 border border-rose-600',
      success:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500 border border-emerald-600',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-2.5 gap-2.5',
      icon: 'p-2 rounded-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
