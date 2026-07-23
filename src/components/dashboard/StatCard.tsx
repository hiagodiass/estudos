import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: ReactNode;
  value: string | number;
  icon: ReactNode;
  iconClassName?: string;
  valueClassName?: string;
}

export function StatCard({ label, value, icon, iconClassName, valueClassName }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted">{label}</p>
          <p className={cn("mt-1 truncate text-2xl font-semibold text-foreground", valueClassName)}>
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent",
            iconClassName
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
