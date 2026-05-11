import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ResponsiveSelect — drop-in replacement for Select.
 * - On desktop: behaves like the standard Select (popover).
 * - On mobile: opens a bottom Drawer (sheet) containing the same options.
 *
 * Props:
 *  - value, onValueChange, placeholder, label
 *  - options: [{ value, label }]  (preferred, for mobile drawer)
 *  - children: optional Select children (used on desktop only)
 *  - className: applied to the trigger
 *  - disabled
 */
export default function ResponsiveSelect({
  value,
  onValueChange,
  placeholder,
  label,
  options = [],
  children,
  className,
  disabled,
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children
            ? children
            : options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
        </SelectContent>
      </Select>
    );
  }

  // Mobile: render trigger button + Drawer
  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label || value || placeholder;

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50',
          !selected && 'text-muted-foreground',
          className
        )}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>{label || placeholder || 'Select an option'}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto pb-6 px-2">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onValueChange?.(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-left text-base transition-colors',
                    active
                      ? 'bg-green-50 text-green-800 font-semibold'
                      : 'text-gray-800 hover:bg-gray-100'
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {active && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}