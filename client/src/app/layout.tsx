import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { BusFront, HeadphonesIcon, Ticket } from "lucide-react";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "redBus — Book Bus Tickets Online",
  description: "India's largest online bus ticketing platform. Book bus tickets with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Clean white header with subtle bottom border */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 cursor-pointer">
              <BusFront className="w-6 h-6 text-[#D84E55]" />
              <span className="text-xl font-bold tracking-tight text-gray-900">
                red<span className="text-[#D84E55]">Bus</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-gray-500">
              <Link href="#" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                <Ticket className="w-3.5 h-3.5" /> My Tickets
              </Link>
              <Link href="#" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                <HeadphonesIcon className="w-3.5 h-3.5" /> Help
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Toaster */}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
