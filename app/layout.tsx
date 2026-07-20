import type { Metadata } from "next";
import { Gelasio, Rozha_One } from "next/font/google";
import { AnalyticsBoot } from "@/components/analytics-boot";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ConsentModal } from "@/components/consent-modal";
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
    "Protein that disappears into dal, curry and raita. They shake, we stir.",
  openGraph: {
    siteName: "Heldi",
    type: "website",
    locale: "en_GB"
  },
  twitter: {
    card: "summary_large_image"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${gelasio.variable} ${rozhaOne.variable}`}>
        <CartProvider>
          <AnalyticsBoot />
          {children}
          <CartDrawer />
          <ConsentModal />
        </CartProvider>
      </body>
    </html>
  );
}
