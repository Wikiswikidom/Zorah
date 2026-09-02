import type { Metadata } from "next";
import "./globals.css";
import "./commerce.css";
import "./landing.css";
import { Cormorant_Garamond, Open_Sans } from "next/font/google";
import { CommerceProvider } from "@/components/commerce-provider";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Open_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Zorah — Crafted to be carried.",
  description: "Contemporary leather handbags crafted with intention in Lagos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>
        <CommerceProvider>{children}</CommerceProvider>
      </body>
    </html>
  );
}
