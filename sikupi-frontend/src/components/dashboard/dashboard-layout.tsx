"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Menu, 
  X, 
  Home, 
  ShoppingBag, 
  Package, 
  Heart, 
  User, 
  Settings, 
  BarChart3,
  MessageSquare,
  Bell,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Container } from "@/components/common/container";
import { cn } from "@/lib/utils";

const DASHBOARD_LINKS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    badge: null,
  },
  {
    label: "Pesanan",
    href: "/dashboard/pesanan",
    icon: ShoppingBag,
    badge: 2,
  },
  {
    label: "Produk",
    href: "/dashboard/produk",
    icon: Package,
    badge: null,
  },
  {
    label: "Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
    badge: null,
  },
  {
    label: "Penjualan",
    href: "/dashboard/penjualan",
    icon: BarChart3,
    badge: null,
  },
  {
    label: "Pesan",
    href: "/dashboard/pesan",
    icon: MessageSquare,
    badge: 3,
  },
];

const ACCOUNT_LINKS = [
  {
    label: "Profil",
    href: "/dashboard/profil",
    icon: User,
  },
  {
    label: "Pengaturan",
    href: "/dashboard/pengaturan",
    icon: Settings,
  },
  {
    label: "Notifikasi",
    href: "/dashboard/notifikasi",
    icon: Bell,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // TODO: Replace with actual user data
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: null,
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* User Profile */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {DASHBOARD_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <Badge variant="secondary" className="h-5 text-xs">
                  {link.badge}
                </Badge>
              )}
            </Link>
          );
        })}

        <Separator className="my-4" />

        {/* Account Section */}
        <div className="space-y-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Akun
          </p>
          {ACCOUNT_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => mobile && setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => {
            // TODO: Implement logout
            console.log("Logout");
          }}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
          <div className="flex flex-col flex-grow border-r bg-background">
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden fixed top-4 left-4 z-50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 lg:pl-72">
          <div className="py-8">
            <Container>
              {children}
            </Container>
          </div>
        </main>
      </div>
    </div>
  );
}