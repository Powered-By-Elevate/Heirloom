import type { Metadata, Viewport } from "next";
import { Yeseva_One, Nunito_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const nunito = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  display: "swap",
});

const yeseva = Yeseva_One({
  variable: "--font-yeseva-one",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "From Our Table — Family Cookbook",
    template: "%s · From Our Table",
  },
  description:
    "A shared cookbook for the recipes your family loves — passed between friends, family, and generations.",
  applicationName: "From Our Table",
  appleWebApp: {
    capable: true,
    title: "From Our Table",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#C48A4A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${yeseva.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
