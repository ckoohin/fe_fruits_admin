'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'indigo' | 'pink';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', color, size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center rounded-full font-medium';
    
    const variants = {
      default: 'bg-gray-100 text-gray-800',
      secondary: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-cyan-100 text-cyan-800',
    };

    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800',
      gray: 'bg-gray-100 text-gray-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      pink: 'bg-pink-100 text-pink-800',
    };
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          color ? colors[color] : variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
