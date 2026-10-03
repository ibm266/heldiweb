import type { Metadata } from "next";
import { Gelasio, Rozha_One } from "next/font/google";
import { AnalyticsBoot } from "@/components/analytics-boot";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ConsentModal } from "@/components/consent-modal";
import { FloatingWaitlistCta } from "@/components/floating-waitlist-cta";
import { VercelAnalytics } from "@/components/vercel-analytics";
import { WaitlistPopupProvider } from "@/components/waitlist-popup";
import { SITE_URL } from "@/lib/site";
import { getWaitlistPairsOpen } from "@/lib/waitlist-count";
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
    "Vegetarian whey protein blends for Indian home cooking. Khana is for savoury dishes; Chai is for hot drinks. They shake, we stir.",
  alternates: {
    types: { "application/rss+xml": "/feed.xml" }
  },
  openGraph: {
    siteName: "Heldi",
    type: "website",
    locale: "en_GB"
  },
  twitter: {
    card: "summary_large_image"
  }
};

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  // Cached and fail-open (lib/waitlist-count.ts): it never throws and never
  // makes a render wait on the database, which matters in a root layout.
  const pairsOpen = await getWaitlistPairsOpen();
  return (
    <html lang="en">
      <body className={`${gelasio.variable} ${rozhaOne.variable}`}>
        <CartProvider>
          <WaitlistPopupProvider pairsOpen={pairsOpen}>
            <AnalyticsBoot />
            {children}
            <FloatingWaitlistCta />
            <CartDrawer />
            <ConsentModal />
            {/* VERCEL is set on Vercel builds and functions only. */}
            {process.env.VERCEL ? <VercelAnalytics /> : null}
          </WaitlistPopupProvider>
        </CartProvider>
      </body>
    </html>
  );
}
