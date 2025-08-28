import Link from "next/link";
import { Coffee, ShoppingCart, Package, BookOpen, Settings, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--sikupi-primary-50), var(--sikupi-coffee-light))' }}>
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Coffee className="h-8 w-8" style={{ color: 'var(--sikupi-primary)' }} />
              <span className="ml-2 text-xl font-bold" style={{ color: 'var(--sikupi-primary-800)' }}>Sikupi</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/products" className="sikupi-nav-link px-3 py-2 rounded-md text-sm font-medium">
                Products
              </Link>
              <Link href="/magazine" className="sikupi-nav-link px-3 py-2 rounded-md text-sm font-medium">
                Magazine
              </Link>
              <Link href="/cart" className="sikupi-nav-link px-3 py-2 rounded-md text-sm font-medium">
                Cart
              </Link>
              <Link href="/orders" className="sikupi-nav-link px-3 py-2 rounded-md text-sm font-medium">
                Orders
              </Link>
              <Link href="/admin" className="sikupi-nav-link px-3 py-2 rounded-md text-sm font-medium">
                Admin
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-2 hover:bg-opacity-10"
                        style={{ 
                          borderColor: 'var(--sikupi-primary)', 
                          color: 'var(--sikupi-primary)',
                        }}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--sikupi-primary-800)' }}>
            Welcome to <span style={{ color: 'var(--sikupi-primary)' }}>Sikupi</span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--sikupi-gray-600)' }}>
            Marketplace ampas kopi dan produk turunannya di Banda Aceh. 
            Transforming coffee waste into valuable products with AI assistance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="text-white font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: 'var(--sikupi-primary)' }}>
                <Coffee className="h-5 w-5 mr-2" />
                Browse Products
              </Button>
            </Link>
            <Link href="/magazine">
              <Button variant="outline" size="lg" className="border-2 hover:bg-opacity-10"
                      style={{ 
                        borderColor: 'var(--sikupi-primary)', 
                        color: 'var(--sikupi-primary)',
                      }}>
                <BookOpen className="h-5 w-5 mr-2" />
                Read Magazine
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards for Testing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow border-2"
                style={{ borderColor: 'var(--sikupi-primary-200)', backgroundColor: 'var(--sikupi-primary-50)' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" style={{ color: 'var(--sikupi-primary)' }} />
                <span style={{ color: 'var(--sikupi-primary-800)' }}>Product Catalog</span>
              </CardTitle>
              <CardDescription style={{ color: 'var(--sikupi-gray-600)' }}>
                Browse coffee grounds (ampas) and derived products with filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/products">
                <Button variant="outline" className="w-full border-2"
                        style={{ 
                          borderColor: 'var(--sikupi-primary)', 
                          color: 'var(--sikupi-primary)',
                        }}>Test Products</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2"
                style={{ borderColor: 'var(--sikupi-coffee-light)', backgroundColor: 'var(--sikupi-earth-sand)' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" style={{ color: 'var(--sikupi-coffee-dark)' }} />
                <span style={{ color: 'var(--sikupi-primary-800)' }}>Order Management</span>
              </CardTitle>
              <CardDescription style={{ color: 'var(--sikupi-gray-600)' }}>
                Cart, checkout, payment via Midtrans, shipping via Biteship
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/cart" className="block">
                  <Button variant="outline" size="sm" className="w-full border-2"
                          style={{ 
                            borderColor: 'var(--sikupi-coffee-dark)', 
                            color: 'var(--sikupi-coffee-dark)',
                          }}>Test Cart</Button>
                </Link>
                <Link href="/orders" className="block">
                  <Button variant="outline" size="sm" className="w-full border-2"
                          style={{ 
                            borderColor: 'var(--sikupi-coffee-dark)', 
                            color: 'var(--sikupi-coffee-dark)',
                          }}>Test Orders</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2"
                style={{ borderColor: 'var(--sikupi-earth-forest)', backgroundColor: 'var(--sikupi-primary-50)' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" style={{ color: 'var(--sikupi-earth-forest)' }} />
                <span style={{ color: 'var(--sikupi-primary-800)' }}>Magazine & AI</span>
              </CardTitle>
              <CardDescription style={{ color: 'var(--sikupi-gray-600)' }}>
                Educational content and SiKupiBot AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/magazine" className="block">
                  <Button variant="outline" size="sm" className="w-full border-2"
                          style={{ 
                            borderColor: 'var(--sikupi-earth-forest)', 
                            color: 'var(--sikupi-earth-forest)',
                          }}>Test Magazine</Button>
                </Link>
                <Link href="/api/ai/chat" className="block">
                  <Button variant="outline" size="sm" className="w-full border-2"
                          style={{ 
                            borderColor: 'var(--sikupi-earth-forest)', 
                            color: 'var(--sikupi-earth-forest)',
                          }}>Test AI Chat</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2"
                style={{ borderColor: 'var(--sikupi-accent-orange)', backgroundColor: 'var(--sikupi-coffee-light)' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" style={{ color: 'var(--sikupi-accent-orange)' }} />
                <span style={{ color: 'var(--sikupi-primary-800)' }}>Admin Panel</span>
              </CardTitle>
              <CardDescription style={{ color: 'var(--sikupi-gray-600)' }}>
                Product management, orders, analytics, magazine posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button variant="outline" className="w-full border-2"
                        style={{ 
                          borderColor: 'var(--sikupi-accent-orange)', 
                          color: 'var(--sikupi-accent-orange)',
                        }}>Test Admin</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2"
                style={{ borderColor: 'var(--sikupi-primary-400)', backgroundColor: 'var(--sikupi-earth-sand)' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" style={{ color: 'var(--sikupi-primary)' }} />
                <span style={{ color: 'var(--sikupi-primary-800)' }}>Authentication</span>
              </CardTitle>
              <CardDescription style={{ color: 'var(--sikupi-gray-600)' }}>
                Login, register, profile management via Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/login" className="block">
                  <Button variant="outline" size="sm" className="w-full border-2"
                          style={{ 
                            borderColor: 'var(--sikupi-primary)', 
                            color: 'var(--sikupi-primary)',
                          }}>Test Login</Button>
                </Link>
                <Link href="/register" className="block">
                  <Button variant="outline" size="sm" className="w-full border-2"
                          style={{ 
                            borderColor: 'var(--sikupi-primary)', 
                            color: 'var(--sikupi-primary)',
                          }}>Test Register</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2"
                style={{ borderColor: 'var(--sikupi-accent-amber)', backgroundColor: 'var(--sikupi-primary-100)' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coffee className="h-5 w-5 mr-2" style={{ color: 'var(--sikupi-accent-amber)' }} />
                <span style={{ color: 'var(--sikupi-primary-800)' }}>AI Analyzer</span>
              </CardTitle>
              <CardDescription style={{ color: 'var(--sikupi-gray-600)' }}>
                Image-based coffee grounds analysis and attribute extraction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/api/ai/analyze">
                <Button variant="outline" className="w-full border-2"
                        style={{ 
                          borderColor: 'var(--sikupi-accent-amber)', 
                          color: 'var(--sikupi-accent-amber)',
                        }}>Test AI Analyzer</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links for API Testing */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2"
             style={{ borderColor: 'var(--sikupi-primary-200)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--sikupi-primary-800)' }}>API Endpoints for Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2" style={{ color: 'var(--sikupi-primary)' }}>Products</h3>
              <ul className="space-y-1" style={{ color: 'var(--sikupi-gray-600)' }}>
                <li>GET /api/products</li>
                <li>GET /api/products/[id]</li>
                <li>POST /api/admin/products</li>
                <li>PUT /api/admin/products/[id]</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2" style={{ color: 'var(--sikupi-coffee-dark)' }}>Orders & Cart</h3>
              <ul className="space-y-1" style={{ color: 'var(--sikupi-gray-600)' }}>
                <li>GET /api/cart</li>
                <li>POST /api/cart/add</li>
                <li>GET /api/orders</li>
                <li>POST /api/orders/[id]/checkout</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2" style={{ color: 'var(--sikupi-earth-forest)' }}>External APIs</h3>
              <ul className="space-y-1" style={{ color: 'var(--sikupi-gray-600)' }}>
                <li>POST /api/midtrans/create-transaction</li>
                <li>POST /api/biteship/rates</li>
                <li>POST /api/ai/analyze</li>
                <li>POST /api/ai/chat</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12" style={{ borderColor: 'var(--sikupi-primary-200)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="mb-2">
              <strong style={{ color: 'var(--sikupi-primary)' }}>Sikupi MVP</strong> - 
              <span style={{ color: 'var(--sikupi-gray-600)' }}> Coffee Grounds Marketplace</span>
            </p>
            <p className="text-sm" style={{ color: 'var(--sikupi-gray-500)' }}>
              Speed over perfection • Banda Aceh • Hackathon Demo
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
