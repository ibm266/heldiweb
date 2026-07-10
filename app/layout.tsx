import type { Metadata } from "next";
import { Gelasio, Rozha_One } from "next/font/google";
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
  title: "Heldi — Desi protein for Indian food",
  description:
    "Protein made to disappear into dal, curry, raita and the home-cooked food you already love."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${gelasio.variable} ${rozhaOne.variable}`}>
        {children}
      </body>
    </html>
  );
}
