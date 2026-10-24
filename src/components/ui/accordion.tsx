import React, { createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn.ts';

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (id: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export function Accordion({
  type = 'single',
  defaultValue,
  className,
  children,
}: {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  className?: string;
  children: React.ReactNode;
}) {
  const [openItems, setOpenItems] = useState<string[]>(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const toggleItem = (id: string) => {
    if (type === 'single') {
      setOpenItems(prev => (prev.includes(id) ? [] : [id]));
    } else {
      setOpenItems(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn('divide-y divide-border rounded-xl border border-border bg-card', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('overflow-hidden', className)}>{children}</div>;
}

export function AccordionTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionTrigger must be used within Accordion');

  const isOpen = ctx.openItems.includes(value);

  return (
    <button
      type="button"
      onClick={() => ctx.toggleItem(value)}
      aria-expanded={isOpen}
      className={cn(
        'flex w-full items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-medium transition-all hover:bg-muted/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        className
      )}
    >
      <span className="flex-1 pr-3">{children}</span>
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
          isOpen && 'rotate-180 text-primary'
        )}
      />
    </button>
  );
}

export function AccordionContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionContent must be used within Accordion');

  const isOpen = ctx.openItems.includes(value);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'p-4 sm:p-5 pt-0 text-sm text-foreground/90 animate-in fade-in-50 duration-200 border-t border-border/40 bg-muted/10',
        className
      )}
    >
      {children}
    </div>
  );
}
