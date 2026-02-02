import type { Metadata, Viewport } from "next";
// Font imports
import "@fontsource/inter"; // Defaults to weight 400
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

import "./globals.css";
import Providers from "../components/layout/Providers";
import LayoutWrapper from "../components/layout/LayoutWrapper";
import { AuthModalProvider } from "../components/auth/AuthModalProvider";
import Script from "next/script";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#10B981",
};

export const metadata: Metadata = {
  title: {
    default: "Zimpy - Fresh Groceries Delivered Fast",
    template: "%s | Zimpy",
  },
  description:
    "Order fresh fruits, vegetables, dairy, snacks and more. Get groceries delivered to your doorstep in minutes. Quality products at best prices.",
  keywords: [
    "grocery delivery",
    "online groceries",
    "fresh vegetables",
    "fruits",
    "dairy products",
    "quick delivery",
    "zimpy",
  ],
  authors: [{ name: "Zimpy" }],
  creator: "Zimpy",
  publisher: "Zimpy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://zimpy.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://zimpy.com",
    siteName: "Zimpy",
    title: "Zimpy - Fresh Groceries Delivered Fast",
    description:
      "Order fresh fruits, vegetables, dairy, snacks and more. Get groceries delivered to your doorstep in minutes.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zimpy - Fresh Groceries",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zimpy - Fresh Groceries Delivered Fast",
    description:
      "Order fresh fruits, vegetables, dairy, snacks and more. Get groceries delivered to your doorstep in minutes.",
    images: ["/og-image.jpg"],
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#F9FAFB] text-[#111827] min-h-screen flex flex-col" suppressHydrationWarning>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <Providers>
          <AuthModalProvider />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}