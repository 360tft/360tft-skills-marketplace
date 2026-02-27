import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aifootball.co";

export const metadata: Metadata = {
  title: {
    default: "AI Football | AI Skills, MCPs & Agents for Football Coaches",
    template: "%s | AI Football",
  },
  description:
    "The first AI agent marketplace for football. Install MCP tools for coaching, refereeing, and scouting to Claude Desktop, ChatGPT, or use on the web. Free to try.",
  keywords: [
    "football AI tools",
    "MCP for football",
    "football coaching AI",
    "AI football agent",
    "football MCP server",
    "coaching AI assistant",
    "referee AI tools",
    "football scouting AI",
  ],
  authors: [{ name: "360TFT", url: "https://360tft.co.uk" }],
  creator: "360TFT",
  publisher: "SVMS Consultancy Limited",
  metadataBase: new URL(baseUrl),
  icons: {
    icon: "/logo-32.png",
    apple: "/logo-180.png",
  },
  openGraph: {
    title: "AI Football | AI Skills, MCPs & Agents for Football Coaches",
    description:
      "Install AI tools for coaching, refereeing, and scouting to Claude Desktop, ChatGPT, or use on the web.",
    siteName: "AI Football",
    type: "website",
    url: baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@360_tft",
    title: "AI Football | AI Skills, MCPs & Agents for Football Coaches",
    description:
      "Install AI tools for coaching, refereeing, and scouting to Claude Desktop, ChatGPT, or use on the web.",
  },
  alternates: {
    canonical: baseUrl,
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "360TFT",
  url: "https://360tft.co.uk",
  logo: `${baseUrl}/logo-512.png`,
  description: "Football coaching education and development",
  foundingDate: "2020",
  parentOrganization: {
    "@type": "Organization",
    name: "SVMS Consultancy Limited",
  },
  sameAs: [
    "https://twitter.com/360_tft",
    "https://www.skool.com/360tft-7374",
    "https://www.skool.com/coachingacademy",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AI Football",
  url: baseUrl,
  description:
    "The first AI agent marketplace for football. MCP tools, agents, and APIs for coaching, refereeing, scouting, and club management.",
  publisher: { "@type": "Organization", name: "360TFT" },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${baseUrl}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-DPTCP1LTH8"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-DPTCP1LTH8');`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
