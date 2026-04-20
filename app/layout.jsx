import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { CartProvider } from "@/lib/CartContext";
import LayoutClient from "@/components/LayoutClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "The Fitting Room Platform | 2D Clothing Try-On",
  description: "Experience professional 2D fitting room for clothing. Browse brands, try on clothes in our fitting room, and shop with confidence.",
  keywords: ["fitting room", "clothing", "fashion", "2D try-on", "online shopping", "try-on"],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "The Fitting Room Platform",
    description: "Experience professional 2D fitting room for clothing",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <LayoutClient>{children}</LayoutClient>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
