import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Emoji or icon node shown above the title */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center gap-3 py-10 px-4",
        className,
      )}
    >
      {icon && (
        <div className="text-3xl text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-xs">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
