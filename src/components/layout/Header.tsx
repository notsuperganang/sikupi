'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User, LogOut, Package, UserCircle, Smile } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useCart } from '@/hooks/useCart'
import { useCartDrawer } from '@/lib/cart-context'
import { 
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton
} from '@/components/ui/resizable-navbar'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, profile, loading, signOut } = useAuth()
  const { cart } = useCart()
  const { openDrawer } = useCartDrawer()

  // Navigation items - Indonesian copy
  const navItems = [
    { name: "Produk", link: "/products" },
    { name: "Majalah", link: "/magazine" },
    { name: "Ampas Analyzer", link: "/analyzer" },
    { name: "Chatbot", link: "/chat" }
  ]

  const cartItemCount = cart?.totals?.itemCount || 0

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getFirstName = (name: string) => {
    return name.split(' ').filter(Boolean)[0] || name
  }

  const getInitial = (fullName?: string | null, fallbackEmail?: string | null) => {
    const base = fullName || fallbackEmail || 'P'
    const first = getFirstName(base)
    return first.charAt(0).toUpperCase()
  }

  return (
    <div className="sticky top-0 z-50">
      <Navbar className="top-0">
        {/* Desktop Navigation */}
        <NavBody className="px-4 lg:px-6">
          {/* Logo */}
          <Link href="/" className="relative z-20 flex items-center space-x-2">
            <Image
              src="/sikupi-logo-horizontal-no-bg.png"
              alt="Sikupi Logo"
              width={220}
              height={80}
              className="h-12 md:h-14 w-auto"
              priority
            />
          </Link>

          {/* Navigation Items */}
          <NavItems 
            items={navItems}
            className="flex-1"
          />

          {/* Right Side Actions */}
          <div className="relative z-20 flex items-center space-x-3">
            {/* Cart Button */}
            <NavbarButton 
              as="button"
              type="button"
              onClick={() => {
                console.log('🖱️ Cart button clicked in header')
                openDrawer()
              }}
              variant="secondary"
              className="relative px-3 py-2"
              aria-label="Buka keranjang"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </NavbarButton>

            {/* Authentication */}
            {loading && !user ? (
              <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="Menu pengguna"
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-stone-600 text-white font-medium shadow-sm hover:bg-stone-500 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
                >
                  {getInitial(profile?.full_name, user.email)}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 pt-1 pb-2 text-xs font-semibold text-stone-600 flex items-center gap-1">
                      <span>Hai {getFirstName(profile?.full_name || user.email || 'Pengguna')} 👋</span>
                    </div>
                    <Link
                      href="/account"
                      className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 items-center"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      Profil
                    </Link>
                    <Link
                      href="/orders"
                      className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 items-center"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Pesanan Saya
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavbarButton 
                href="/login"
                variant="primary"
                className="px-4 py-2"
              >
                Masuk
              </NavbarButton>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav className="px-4">
          <MobileNavHeader>
            {/* Mobile Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/sikupi-logo-horizontal-no-bg.png"
                alt="Sikupi Logo"
                width={180}
                height={64}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2">
              {/* Mobile Cart */}
              <NavbarButton 
                as="button"
                type="button"
                onClick={() => {
                  console.log('🖱️ Mobile cart button clicked')
                  openDrawer()
                }}
                variant="secondary"
                className="relative px-2 py-2"
                aria-label="Buka keranjang"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium text-[10px]">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </NavbarButton>

              {/* Mobile Menu Toggle */}
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          {/* Mobile Menu */}
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
            className="w-full"
          >
            {/* Navigation Items */}
            <div className="w-full space-y-2">
              {navItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.link}
                  className="block w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={handleMobileMenuClose}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Actions */}
            <div className="w-full pt-4 border-t border-gray-200 space-y-2">
      {user ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
        Hai, {getFirstName(profile?.full_name || user.email || 'Pengguna')}!
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                    onClick={handleMobileMenuClose}
                  >
                    <UserCircle className="h-4 w-4 mr-3" />
                    Profil
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                    onClick={handleMobileMenuClose}
                  >
                    <Package className="h-4 w-4 mr-3" />
                    Pesanan Saya
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 bg-amber-600 text-white text-center rounded-md font-medium hover:bg-amber-700 transition-colors"
                  onClick={handleMobileMenuClose}
                >
                  Masuk
                </Link>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  )
}

export default Header