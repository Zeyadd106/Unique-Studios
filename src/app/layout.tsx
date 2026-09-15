import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/hooks/use-locale";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

// Single brand font (Cairo, latin + arabic) — same approach as Van-Graph.
const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UNIQUE STUDIOS - Premium Streetwear",
  description:
    "Premium oversized streetwear for those who dare to stand out. Built Different. Worn Unique.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cairo.variable} antialiased`}>
      <body className="min-h-screen flex flex-col font-sans">
        <LocaleProvider>
          {children}
          <WhatsAppFloat />
        </LocaleProvider>
      </body>
    </html>
  );
}
