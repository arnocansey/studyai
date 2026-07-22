import { AlertCircle, Inbox, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description ? (
            <p className="max-w-sm text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <Button size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <Card className={cn("border-destructive/30 bg-destructive/5", className)}>
      <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] items-center justify-center text-sm text-muted-foreground",
        className,
      )}
    >
      {label}
    </div>
  );
}
