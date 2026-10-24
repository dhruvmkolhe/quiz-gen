import React from 'react';
import { cn } from '../../utils/cn.ts';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/70 dark:bg-muted/40', className)}
      {...props}
    />
  );
}
