import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "360TFT Skills Marketplace | AI Tools for Football Coaches",
  description:
    "Discover AI-powered tools for football coaching, refereeing, player development, and club management. Install to Claude Desktop, ChatGPT, or use on the web.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://skills.360tft.com"
  ),
  openGraph: {
    title: "360TFT Skills Marketplace",
    description: "AI tools built for football coaches",
    siteName: "360TFT Skills Marketplace",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
