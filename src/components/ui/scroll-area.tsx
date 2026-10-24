import React from 'react';
import { cn } from '../../utils/cn.ts';

export function ScrollArea({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative overflow-y-auto overflow-x-hidden scrollbar-thin', className)}
      {...props}
    >
      {children}
    </div>
  );
}
