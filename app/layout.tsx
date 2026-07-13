import type { Metadata } from "next";
import { Gelasio, Rozha_One } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { DevModeToggle } from "@/components/cart/dev-mode-toggle";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const gelasio = Gelasio({
  variable: "--font-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  display: "swap"
});

const rozhaOne = Rozha_One({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Heldi, desi protein for Indian food",
  description:
    "Protein that disappears into dal, curry and raita. They shake, we stir."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${gelasio.variable} ${rozhaOne.variable}`}>
        <CartProvider>
          {children}
          <CartDrawer />
          <DevModeToggle />
        </CartProvider>
      </body>
    </html>
  );
}
