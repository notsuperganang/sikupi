import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartClient from "@/components/cart/CartClient";
import { CartProvider } from "@/lib/cart-context";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <CartClient>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </CartClient>
    </CartProvider>
  );
}
