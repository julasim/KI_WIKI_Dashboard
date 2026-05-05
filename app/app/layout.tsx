import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/shell";
import { AutoRefresh } from "@/components/auto-refresh";
import { SessionProvider } from "@/components/session-provider";
import { QuickActionsGate } from "@/components/quick-actions-gate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal OS — Julius",
  description: "Persönliches Tracking & Knowledge-Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SessionProvider>
          <AutoRefresh />
          <Shell>{children}</Shell>
          <QuickActionsGate />
        </SessionProvider>
      </body>
    </html>
  );
}
