// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { site } from "@/config/site";
import { GlobalLoadingScreen } from "@/components/global-loading-screen";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} â€” ${site.tagline}`,
    template: `%s Â· ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  icons: {
    icon: "https://www.tiktok.com/favicon.ico",
    shortcut: "https://www.tiktok.com/favicon.ico",
    apple: "https://www.tiktok.com/favicon.ico",
  },
  openGraph: {
    title: `${site.name} â€” ${site.tagline}`,
    description: site.description,
    siteName: site.name,
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0f13" },
    { media: "(prefers-color-scheme: light)", color: "#f7f7f9" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-background font-sans text-foreground antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <GlobalLoadingScreen />
          <div className="flex min-h-dvh flex-col">
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
