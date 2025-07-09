// FILE PATH: /sikupi-frontend/src/components/layout/header.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, X, User, LogIn, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Container } from "@/components/common/container";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { NAV_LINKS, USER_MENU_ITEMS, APP_CONFIG } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Use real auth state
  const { user, isAuthenticated, logout } = useAuthStore();
  const { summary } = useCartStore();
  const cartItemCount = summary.totalItems;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
              ? "text-primary" 
              : "text-muted-foreground",
            mobile && "text-base"
          )}
          onClick={() => mobile && setIsOpen(false)}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );

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
              className="w-10 h-10"
            />
            <span className="text-xl font-bold">{APP_CONFIG.NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex">
            <NavLinks />
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari ampas kopi..."
                className="pl-10 w-64"
              />
            </div>

            {/* Cart */}
            <CartDrawer>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.fullName}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{user.fullName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {USER_MENU_ITEMS.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/masuk">
                    <LogIn className="w-4 h-4 mr-2" />
                    Masuk
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/daftar">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Daftar
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart */}
            <CartDrawer>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between pb-6 border-b">
                    <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                      <Image
                        src={APP_CONFIG.LOGO_PATH}
                        alt={APP_CONFIG.NAME}
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                      <span className="text-lg font-bold">{APP_CONFIG.NAME}</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Mobile Search */}
                  <div className="py-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Cari ampas kopi..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Mobile User Info */}
                  {isAuthenticated && user && (
                    <div className="py-4 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {user.avatarUrl ? (
                            <Image
                              src={user.avatarUrl}
                              alt={user.fullName}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-6">
                    <NavLinks mobile />
                    
                    {isAuthenticated && user && (
                      <>
                        <div className="my-6 border-t" />
                        <div className="space-y-4">
                          {USER_MENU_ITEMS.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block text-base font-medium transition-colors hover:text-primary"
                              onClick={() => setIsOpen(false)}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </nav>

                  {/* Mobile Actions */}
                  <div className="pt-6 border-t">
                    {isAuthenticated && user ? (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Keluar
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button asChild className="w-full">
                          <Link href="/daftar" onClick={() => setIsOpen(false)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Daftar
                          </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                          <Link href="/masuk" onClick={() => setIsOpen(false)}>
                            <LogIn className="w-4 h-4 mr-2" />
                            Masuk
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  );
}