import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyBottomBar from "@/components/layout/StickyBottomBar";

export const metadata: Metadata = {
  title: "Odd Job Heroes | Reliable Help for Everyday Jobs",
  description:
    "Professional hauling, handyman services, yard work, and general labor for seniors. Photo estimates, clear pricing, and personal service you can trust.",
  keywords: [
    "handyman services",
    "hauling",
    "yard work",
    "senior services",
    "home repairs",
    "general labor",
  ],
  authors: [{ name: "Odd Job Heroes" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#0066CC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <StickyBottomBar />
      </body>
    </html>
  );
}
