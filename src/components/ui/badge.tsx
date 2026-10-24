import React from 'react';
import { cn } from '../../utils/cn.ts';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'accent';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantClasses = {
    default: 'border-transparent bg-primary text-primary-foreground shadow-xs',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    destructive: 'border-transparent bg-destructive/15 text-destructive border border-destructive/30 font-medium',
    outline: 'text-foreground border border-border',
    success: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-medium',
    accent: 'border-transparent bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-medium',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
