"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Ticket } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="surface overflow-hidden text-center">
      <div className="px-8 py-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50">
          <CheckCircle2 className="size-7 text-zinc-950" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-950">Booking confirmed</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-500">
          Your payment was successful and your seats have been reserved.
        </p>

        {bookingId && (
          <div className="mt-6 inline-block rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4">
            <span className="label block">Booking ID</span>
            <span className="mt-1 block font-mono text-lg font-semibold text-zinc-950">#{bookingId}</span>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 px-8 py-5">
        <Button asChild>
          <Link href="/">
            <Ticket className="size-4" />
            Back home
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-start justify-center bg-zinc-50 px-4 pt-16">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="py-10 text-center text-sm text-zinc-500">Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
