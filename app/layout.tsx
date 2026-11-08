import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"] });

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://bingo.benjidevelops.com";

export const viewport: Viewport = {
  themeColor: "#24382C",
};

export const metadata: Metadata = {
  title: "Together, Not For Bingo",
  description:
    "Pick 24 things you want to do in 2026, make a bingo card, and send it to your friends",
  keywords: [
    "2026 goals bingo",
    "resolution bingo",
    "new year goals bingo card",
    "printable bingo card",
    "custom bingo card maker",
  ],
  authors: [{ name: "Together, Not For" }],
  creator: "Together, Not For",
  publisher: "Together, Not For",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Together, Not For Bingo",
    description:
      "Pick 24 things you want to do in 2026, make a bingo card, and send it to your friends",
    type: "website",
    url: "/",
    siteName: "Together, Not For Bingo",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Together, Not For Bingo",
    description:
      "Pick 24 things you want to do in 2026, make a bingo card, and send it to your friends",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={figtree.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
