"use client";

import { cn } from "@/lib/utils";

interface ToggleButtonProps {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ToggleButton({
  selected,
  onClick,
  disabled,
  children,
  className,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-base font-medium transition-colors text-center",
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
          : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
