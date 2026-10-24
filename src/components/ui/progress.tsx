import React from 'react';
import { cn } from '../../utils/cn.ts';

export function Progress({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
}: {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-secondary', className)}
    >
      <div
        className={cn('h-full bg-primary transition-all duration-500 ease-in-out', indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
