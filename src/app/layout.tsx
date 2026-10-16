import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import "@/styles/home.css";
import { LocaleProvider } from "@/hooks/use-locale";

// Single brand font (Cairo, latin + arabic) — same approach as Van-Graph.
const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "UNIQUE STUDIOS - Premium Streetwear",
  description:
    "Premium oversized streetwear for those who dare to stand out. Built Different. Worn Unique.",
  icons: {
    icon: "/logo-light.png",
    shortcut: "/logo-light.png",
    apple: "/logo-light.png",
  },
  openGraph: {
    title: "UNIQUE STUDIOS - Premium Streetwear",
    description:
      "Premium oversized streetwear for those who dare to stand out. Built Different. Worn Unique.",
    images: ["/logo-light.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cairo.variable} antialiased`}>
      <body className="min-h-screen flex flex-col font-sans">
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
