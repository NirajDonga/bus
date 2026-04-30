import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { BusFront, HeadphonesIcon, LogIn, Ticket, UserPlus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Busline - Book Bus Tickets Online",
  description: "A clean bus ticket booking experience for routes, seats, and payments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
          <div className="page-shell flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-zinc-950 text-white">
                <BusFront className="size-4" />
              </span>
              <span className="text-base font-semibold tracking-tight text-zinc-950">Busline</span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-500 md:flex">
              <Link href="#" className="flex items-center gap-2 transition-colors hover:text-zinc-950">
                <Ticket className="size-4" />
                My Tickets
              </Link>
              <Link href="#" className="flex items-center gap-2 transition-colors hover:text-zinc-950">
                <HeadphonesIcon className="size-4" />
                Help
              </Link>
              <Link href="/login" className="flex items-center gap-2 transition-colors hover:text-zinc-950">
                <LogIn className="size-4" />
                Login
              </Link>
              <Link href="/signup" className="flex items-center gap-2 transition-colors hover:text-zinc-950">
                <UserPlus className="size-4" />
                Sign up
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow">{children}</main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
