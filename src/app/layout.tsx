import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Football | The AI Agent Marketplace for Football",
  description:
    "The first AI agent marketplace for football. MCPs, agents, and APIs for coaching, refereeing, scouting, and club management. Install to Claude Desktop, ChatGPT, or use on the web.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://aifootball.co"
  ),
  openGraph: {
    title: "AI Football | The AI Agent Marketplace for Football",
    description: "MCPs, agents, and APIs built for football",
    siteName: "AI Football",
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
