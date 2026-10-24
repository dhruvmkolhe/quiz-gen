import React, { createContext, useContext } from 'react';
import { cn } from '../../utils/cn.ts';

interface RadioGroupContextValue {
  name?: string;
  value: string;
  onValueChange: (val: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function RadioGroup({
  name,
  value,
  onValueChange,
  disabled = false,
  className,
  children,
}: {
  name?: string;
  value: string;
  onValueChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <RadioGroupContext.Provider value={{ name, value, onValueChange, disabled }}>
      <div role="radiogroup" className={cn('grid gap-2', className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({
  value,
  id,
  className,
  disabled,
}: {
  value: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}) {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error('RadioGroupItem must be used within RadioGroup');

  const isChecked = ctx.value === value;
  const isDisabled = disabled || ctx.disabled;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isChecked}
      disabled={isDisabled}
      id={id}
      onClick={() => !isDisabled && ctx.onValueChange(value)}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-colors',
        isChecked ? 'border-primary' : 'border-muted-foreground/40',
        className
      )}
    >
      {isChecked && (
        <span className="h-2 w-2 rounded-full bg-primary animate-in zoom-in-75 duration-100" />
      )}
    </button>
  );
}
