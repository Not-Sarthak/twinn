import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/components/header/navbar";
import { Footer } from "./components/footer/footer";
import { BgGradient } from "./components/ui/bg-gradient";
import { cx } from "./lib/utils";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { appleGaramond } from "./lib/fonts";
import Script from "next/script";
import { Providers } from "./providers/privy-provider";

export const metadata: Metadata = {
  title: "Twinn",
  description: "Twinn",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Twinn",
    description: "Twinn",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Twinn",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Twinn",
    description: "Twinn",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`bg-bg-primary ${GeistMono.variable} ${GeistSans.variable} ${appleGaramond.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans md:max-w-7xl lg:mx-auto lg:flex-row">
        <Providers>
          <main
            className={cx(
              "relative flex flex-1 flex-col overflow-x-hidden border-x border-border-primary/50",
            )}
          >
            <Navbar />
            <div className="grid flex-1 grid-cols-1 lg:grid-cols-[32px_1fr_32px]">
              <div className="hidden w-full border-r border-border-primary opacity-75 [background-image:linear-gradient(45deg,theme(colors.border-primary)_12.50%,transparent_12.50%,transparent_50%,theme(colors.border-primary)_50%,theme(colors.border-primary)_62.50%,transparent_62.50%,transparent_100%)] [background-size:5px_5px] lg:block"></div>
              <div className="relative col-span-1 px-3 lg:px-0">
                <BgGradient />
                {children}
              </div>
              <div className="hidden w-full border-l border-border-primary opacity-75 [background-image:linear-gradient(45deg,theme(colors.border-primary)_12.50%,transparent_12.50%,transparent_50%,theme(colors.border-primary)_50%,theme(colors.border-primary)_62.50%,transparent_62.50%,transparent_100%)] [background-size:5px_5px] lg:block"></div>
            </div>
            <Footer />
          </main>
        </Providers>
      </body>

      <Script id="vemetric-loader" strategy="afterInteractive">
        {`
          window.vmtrcq = window.vmtrcq || [];
          window.vmtrc = window.vmtrc || ((...args) => window.vmtrcq.push(args));
        `}
      </Script>

      <Script
        src="https://cdn.vemetric.com/main.js"
        data-token="HUO9AbX53v2wkzRu"
        strategy="afterInteractive"
      />
    </html>
  );
}
