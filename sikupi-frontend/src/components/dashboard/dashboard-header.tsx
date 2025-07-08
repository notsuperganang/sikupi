import { Breadcrumb, BreadcrumbItem } from "@/components/common/breadcrumb";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  description,
  breadcrumbs = [],
  action,
  className,
}: DashboardHeaderProps) {
  const allBreadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    ...breadcrumbs,
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb items={allBreadcrumbs} showHome={false} />
      )}

      {/* Header Content */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="flex items-center space-x-2">{action}</div>}
      </div>
    </div>
  );
}