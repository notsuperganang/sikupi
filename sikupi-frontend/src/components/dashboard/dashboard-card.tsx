"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  className?: string;
}

export function DashboardCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  className 
}: DashboardCardProps) {
  // DIUBAH: Menggunakan warna dari tema
  const changeColors = {
    positive: "text-emerald-600 dark:text-emerald-500",
    negative: "text-destructive",
    neutral: "text-muted-foreground"
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {value}
        </div>
        {change && (
          <p className={`text-xs mt-1 ${changeColors[changeType]}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
