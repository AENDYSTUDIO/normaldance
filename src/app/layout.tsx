import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NORMAL DANCE - Децентрализованная музыкальная платформа",
  description: "Революционная децентрализованная музыкальная платформа, созданная для предоставления артистам полного контроля над их творчеством и монетизацией.",
  keywords: ["NORMAL DANCE", "музыка", "децентрализация", "Web3", "блокчейн", "NFT", "крипто"],
  authors: [{ name: "NORMAL DANCE Team" }],
  openGraph: {
    title: "NORMAL DANCE - Децентрализованная музыкальная платформа",
    description: "Революционная децентрализованная музыкальная платформа для артистов и слушателей",
    url: "https://normaldance.app",
    siteName: "NORMAL DANCE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NORMAL DANCE - Децентрализованная музыкальная платформа",
    description: "Революционная децентрализованная музыкальная платформа для артистов и слушателей",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
