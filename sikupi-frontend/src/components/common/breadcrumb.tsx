import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumb({ items, className, showHome = true }: BreadcrumbProps) {
  const allItems = showHome 
    ? [{ label: "Beranda", href: "/", icon: Home }, ...items]
    : items;

  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      {allItems.map((item, index) => (
        <Fragment key={index}>
          <div className="flex items-center">
            {item.icon && (
              <item.icon className="h-4 w-4 mr-1 text-muted-foreground" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </div>
          {index < allItems.length - 1 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </Fragment>
      ))}
    </nav>
  );
}