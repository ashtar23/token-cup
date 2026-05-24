"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MatchFiltersProps {
  groups: string[];
  selectedGroup: string | null;
  onGroupChange: (g: string | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function MatchFilters({
  groups,
  selectedGroup,
  onGroupChange,
  searchQuery,
  onSearchChange,
}: MatchFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by team…"
          className="pl-9 pr-9 h-10 text-base"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {groups.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={selectedGroup === null}
            onClick={() => onGroupChange(null)}
          >
            All groups
          </FilterChip>
          {groups.map((g) => (
            <FilterChip
              key={g}
              active={selectedGroup === g}
              onClick={() => onGroupChange(selectedGroup === g ? null : g)}
            >
              {g}
            </FilterChip>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
