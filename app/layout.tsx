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

import Link from 'next/link'; // Import Link for navigation

export const metadata: Metadata = {
  title: "Second Brain",
  description: "A personal knowledge management system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full w-full`}
      >
        <nav className="bg-gray-800 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex space-x-4">
              <Link href="/" className="hover:text-gray-300">Home</Link>
              <Link href="/debate-prep" className="hover:text-gray-300">Debate Prep</Link>
              <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
              <Link href="/sandbox" className="hover:text-gray-300">Ingestion Sandbox</Link>
              {/* Report page might need a specific resource ID, so not linking directly here */}
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
