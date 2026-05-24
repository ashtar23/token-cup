"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  searchHint?: string;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  renderValue?: (option: ComboboxOption | undefined) => React.ReactNode;
  disabled?: boolean;
  /** Row height for the virtualizer. Defaults to 40px. */
  itemHeight?: number;
}

const ROW_HEIGHT_DEFAULT = 40;
const LIST_MAX_HEIGHT_PX = 320;

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No results.",
  className,
  renderValue,
  disabled,
  itemHeight = ROW_HEIGHT_DEFAULT,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const listboxId = React.useId();
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-primary/50",
            className,
          )}
        >
          <span
            className={cn(
              "truncate text-left flex-1 min-w-0",
              !selected && "text-muted-foreground",
            )}
          >
            {renderValue ? (
              renderValue(selected)
            ) : selected ? (
              <span className="flex items-center gap-2">
                {selected.prefix}
                {selected.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-60 shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ComboboxContent
          options={options}
          value={value}
          onSelect={(v) => {
            onChange(v);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
          itemHeight={itemHeight}
          searchPlaceholder={searchPlaceholder}
          emptyMessage={emptyMessage}
          listboxId={listboxId}
        />
      </PopoverContent>
    </Popover>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

interface ComboboxContentProps {
  options: ComboboxOption[];
  value?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  itemHeight: number;
  searchPlaceholder: string;
  emptyMessage: string;
  listboxId: string;
}

function ComboboxContent({
  options,
  value,
  onSelect,
  onClose,
  itemHeight,
  searchPlaceholder,
  emptyMessage,
  listboxId,
}: ComboboxContentProps) {
  const [search, setSearch] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(() => {
    const i = options.findIndex((o) => o.value === value);
    return i >= 0 ? i : 0;
  });
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Focus input after popover finishes animating in
  React.useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const hay = `${o.label} ${o.searchHint ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, search]);

  const safeActiveIndex =
    filtered.length === 0 ? 0 : Math.min(activeIndex, filtered.length - 1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filtered.length === 0) {
      if (e.key === "Escape") onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[safeActiveIndex];
      if (opt && !opt.disabled) onSelect(opt.value);
    } else if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(filtered.length - 1);
    }
  };

  return (
    <>
      {/* Search */}
      <div className="flex items-center border-b border-border px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={searchPlaceholder}
          className="flex h-10 w-full bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <VirtualizedList
          items={filtered}
          value={value}
          activeIndex={safeActiveIndex}
          setActiveIndex={setActiveIndex}
          onSelect={onSelect}
          itemHeight={itemHeight}
          listboxId={listboxId}
        />
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

interface VirtualizedListProps {
  items: ComboboxOption[];
  value?: string;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  onSelect: (value: string) => void;
  itemHeight: number;
  listboxId: string;
}

function VirtualizedList({
  items,
  value,
  activeIndex,
  setActiveIndex,
  onSelect,
  itemHeight,
  listboxId,
}: VirtualizedListProps) {
  const parentRef = React.useRef<HTMLDivElement | null>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 6,
  });

  // Keep the active row in view on arrow-key navigation
  React.useEffect(() => {
    if (items.length === 0) return;
    virtualizer.scrollToIndex(activeIndex, { align: "auto" });
  }, [activeIndex, items.length, virtualizer]);

  const totalSize = virtualizer.getTotalSize();
  const visible = virtualizer.getVirtualItems();

  return (
    <div
      id={listboxId}
      ref={parentRef}
      className="overflow-y-auto overflow-x-hidden p-1"
      style={{ maxHeight: LIST_MAX_HEIGHT_PX }}
      role="listbox"
    >
      <div
        style={{
          height: totalSize > 0 ? totalSize : items.length * itemHeight,
          position: "relative",
          width: "100%",
        }}
      >
        {visible.map((v) => {
          const opt = items[v.index];
          const isActive = v.index === activeIndex;
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={opt.disabled}
              onClick={() => onSelect(opt.value)}
              onMouseEnter={() => setActiveIndex(v.index)}
              className={cn(
                "absolute left-0 top-0 flex w-full items-center rounded-md px-2 text-base outline-none transition-colors text-left",
                "disabled:pointer-events-none disabled:opacity-50",
                isActive && "bg-accent text-accent-foreground",
              )}
              style={{
                height: v.size,
                transform: `translateY(${v.start}px)`,
              }}
            >
              <span className="flex items-center gap-2 flex-1 min-w-0">
                {opt.prefix}
                <span className="truncate">{opt.label}</span>
              </span>
              {opt.suffix}
              <Check
                className={cn(
                  "ml-2 h-4 w-4 shrink-0",
                  isSelected ? "opacity-100" : "opacity-0",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
