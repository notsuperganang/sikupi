"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, X, User, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Container } from "@/components/common/container";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { NAV_LINKS, USER_MENU_ITEMS, APP_CONFIG } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // TODO: Replace with actual auth state
  const isAuthenticated = false;
  const user = null as { name: string } | null;
  const { summary } = useCartStore();
  const cartItemCount = summary.totalItems;

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      "flex gap-6",
      mobile && "flex-col space-y-4"
    )}>
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === link.href 
              ? "text-primary border-b-2 border-primary pb-1" 
              : "text-muted-foreground"
          )}
          onClick={() => mobile && setIsOpen(false)}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );

  const UserMenu = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/masuk">
              <LogIn className="h-4 w-4 mr-2" />
              Masuk
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/daftar">
              <UserPlus className="h-4 w-4 mr-2" />
              Daftar
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            {user?.name || "Pengguna"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {USER_MENU_ITEMS.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={APP_CONFIG.LOGO_PATH}
              alt={APP_CONFIG.NAME}
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-primary">
              {APP_CONFIG.NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <NavLinks />
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-md mx-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Cari produk ampas kopi..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <CartDrawer>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            {/* User Menu */}
            <UserMenu />
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-6 mt-6">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Cari produk..."
                    className="pl-10"
                  />
                </div>

                {/* Mobile Navigation */}
                <nav>
                  <NavLinks mobile />
                </nav>

                {/* Mobile Actions */}
                <div className="flex flex-col space-y-4 pt-4 border-t">
                  <CartDrawer>
                    <Button variant="outline" className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Keranjang
                      </div>
                      {cartItemCount > 0 && (
                        <Badge variant="secondary">{cartItemCount}</Badge>
                      )}
                    </Button>
                  </CartDrawer>

                  {!isAuthenticated ? (
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" asChild>
                        <Link href="/masuk">
                          <LogIn className="h-4 w-4 mr-2" />
                          Masuk
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href="/daftar">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Daftar
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      {USER_MENU_ITEMS.map((item) => (
                        <Button key={item.href} variant="ghost" asChild>
                          <Link href={item.href}>{item.label}</Link>
                        </Button>
                      ))}
                      <Button variant="ghost" className="text-red-600">
                        Keluar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}