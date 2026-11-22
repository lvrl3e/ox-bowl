import type { Metadata, Viewport } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oxbowl.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ox Bowl Resto & Grill — Order Online",
    template: "%s | Ox Bowl Resto & Grill",
  },
  description:
    "Crispy sa unang kagat, sulit hanggang huling subo! Order Filipino chicken, pork, beef and seafood favorites from Ox Bowl Resto & Grill for pickup or delivery.",
  openGraph: {
    title: "Ox Bowl Resto & Grill — Order Online",
    description:
      "Crispy sa unang kagat, sulit hanggang huling subo! Pickup and delivery only.",
    url: siteUrl,
    siteName: "Ox Bowl Resto & Grill",
    images: ["/og-image.jpg"],
    locale: "en_PH",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1a0d0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${oswald.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
