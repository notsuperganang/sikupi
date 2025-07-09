// FILE: src/components/layout/header.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  Search, 
  Menu, 
  X, 
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Container } from "@/components/common/container"; // Asumsi Anda punya komponen ini
import { CartDrawer } from "@/components/cart/cart-drawer";

import { useAuthStore } from "@/stores/auth-store";
import { useCartCount } from "@/lib/hooks/use-cart";
import { useLogout } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import { APP_CONFIG, NAV_LINKS, SELLER_MENU_ITEMS, BUYER_MENU_ITEMS } from "@/lib/constants";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  
  const { user, isAuthenticated } = useAuthStore();
  const { data: cartCount } = useCartCount();
  const logoutMutation = useLogout();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produk?search=${encodeURIComponent(searchQuery.trim())}`);
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav className={cn("flex items-center", isMobile ? "flex-col space-y-4" : "space-x-6")}>
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === link.href ? "text-primary" : "text-muted-foreground",
            isMobile && "text-lg"
          )}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
  
  const userMenuItems = user?.userType === 'seller' ? SELLER_MENU_ITEMS : BUYER_MENU_ITEMS;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src={APP_CONFIG.LOGO_PATH}
                alt={APP_CONFIG.NAME}
                width={32}
                height={32}
              />
              <span className="hidden sm:inline-block text-lg font-bold">{APP_CONFIG.NAME}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex">
              <NavLinks />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari ampas kopi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48 lg:w-64"
              />
            </form>

            {/* Cart */}
            <CartDrawer>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount && cartCount.count > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                    {cartCount.count}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                     <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/masuk"><LogIn className="mr-2 h-4 w-4" /> Masuk</Link>
                </Button>
                <Button asChild>
                  <Link href="/daftar"><UserPlus className="mr-2 h-4 w-4" /> Daftar</Link>
                </Button>
              </div>
            )}
            
            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between pb-6 border-b">
                      <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2">
                         <Image src={APP_CONFIG.LOGO_PATH} alt={APP_CONFIG.NAME} width={32} height={32}/>
                         <span className="text-lg font-bold">{APP_CONFIG.NAME}</span>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <form onSubmit={handleSearch} className="py-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari ampas kopi..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </form>
                    
                    <div className="flex-1 border-t pt-6">
                      <NavLinks isMobile />
                    </div>

                    <div className="pt-6 border-t">
                      {isAuthenticated ? (
                         <Button variant="outline" className="w-full" onClick={handleLogout}>
                           <LogOut className="mr-2 h-4 w-4" /> Keluar
                         </Button>
                      ) : (
                        <div className="space-y-2">
                          <Button className="w-full" asChild>
                            <Link href="/masuk" onClick={() => setIsMobileMenuOpen(false)}>Masuk</Link>
                          </Button>
                          <Button variant="outline" className="w-full" asChild>
                            <Link href="/daftar" onClick={() => setIsMobileMenuOpen(false)}>Daftar</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}