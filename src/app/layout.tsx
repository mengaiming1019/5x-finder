import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: [
    { path: "../../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/next/dist/next-devtools/server/font/geist-latin-ext.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: [
    { path: "../../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/next/dist/next-devtools/server/font/geist-mono-latin-ext.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "5X Finder — AI-Powered Fintech Stock Picking Model",
  description: "Advanced multi-factor stock picking model that identifies the most promising Fintech stocks with 5x growth potential over 2 years, powered by AI analysis and industry expertise.",
  keywords: ["Fintech", "Stock Picking", "AI Analysis", "5X Returns", "Investment Model"],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
