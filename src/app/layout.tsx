import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Campaign Institute — Campaign OS | AI-Powered Campaign Platform",
    template: "%s | Campaign Institute",
  },
  description:
    "Campaign OS is the most advanced AI-powered campaign platform. Unify CRM, texting, phone banking, voter analytics, and fundraising into one platform. The power of 3 full-time staffers.",
  keywords: [
    "campaign software",
    "political campaign tools",
    "AI campaign platform",
    "voter CRM",
    "campaign texting",
    "phone banking software",
    "voter analytics",
    "campaign fundraising",
    "Campaign OS",
    "Campaign Institute",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Campaign Institute — Campaign OS",
    description:
      "The most advanced AI-powered campaign platform. CRM, texting, phone banking, analytics, and fundraising — all in one place.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campaign Institute — Campaign OS",
    description:
      "AI-powered campaign platform with the power of 3 full-time staffers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
