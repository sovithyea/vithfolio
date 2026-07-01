import type { Metadata } from "next";
import { Lora, Caveat } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vith — Walkable Portfolio",
  description: "Walk around Phnom Penh and Melbourne to explore my work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
