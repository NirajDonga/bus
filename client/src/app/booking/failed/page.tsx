"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function BookingFailedPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-start justify-center bg-zinc-50 px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="surface overflow-hidden text-center">
          <div className="px-8 py-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50">
              <AlertCircle className="size-7 text-zinc-950" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-950">Payment failed</h1>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-500">
              Your checkout session expired or payment could not be processed. Locked seats have been released.
            </p>
          </div>

          <div className="border-t border-zinc-200 px-8 py-5">
            <Button asChild>
              <Link href="/">
                <RefreshCw className="size-4" />
                Search again
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
