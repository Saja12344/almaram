import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { CareerProvider } from "@/contexts/career-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Almaram — المرام | Your career destination",
  description:
    "A premium AI career platform that understands your path and guides you toward the roles you aspire to reach.",
  icons: {
    icon: [
      { url: "/brand/logo-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/brand/logo-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/brand/logo-dark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${arabic.variable} min-h-full font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CareerProvider>{children}</CareerProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
