import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2026 Bingo Card Generator",
  description: "Create and print custom bingo cards for 2026",
  keywords: [
    "bingo card generator",
    "bingo cards",
    "custom bingo cards",
    "printable bingo cards",
    "2026 bingo",
    "bingo card maker",
    "create bingo cards",
    "bingo game",
    "bingo template",
    "free bingo cards",
    "online bingo generator",
    "bingo card creator",
    "print bingo cards",
    "bingo card printer",
    "customizable bingo",
  ],
  authors: [{ name: "Together, Not For" }],
  creator: "Together, Not For",
  publisher: "Together, Not For",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://bingo-cards-delta.vercel.app"
  ),
  openGraph: {
    title: "2026 Bingo Card Generator",
    description:
      "Create and print custom bingo cards for 2026. Add your items, generate your card, and start playing!",
    type: "website",
    url: "/",
    siteName: "2026 Bingo Card Generator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "2026 Bingo Card Generator",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 Bingo Card Generator",
    description: "Create and print custom bingo cards for 2026",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
