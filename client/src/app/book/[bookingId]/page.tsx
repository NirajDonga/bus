"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, Bus, Clock, ShieldCheck } from "lucide-react";

export default function BookPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: Number(bookingId) }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to initiate payment");
        setLoading(false);
      }
    } catch {
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50 px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="surface overflow-hidden">
          <div className="border-b border-zinc-200 px-6 py-5">
            <p className="label">Checkout</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">Review booking</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Reference <span className="font-mono font-medium text-zinc-950">#{bookingId}</span>
            </p>
          </div>

          <div className="px-6 py-5">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="label">Boarding</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">Station A</p>
                </div>
                <div className="hidden flex-1 items-center gap-3 sm:flex">
                  <span className="h-px flex-1 border-t border-dashed border-zinc-300" />
                  <Bus className="size-4 text-zinc-500" />
                  <span className="h-px flex-1 border-t border-dashed border-zinc-300" />
                </div>
                <div className="text-right">
                  <p className="label">Dropping</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">Station B</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4">
              <Clock className="mt-0.5 size-4 shrink-0 text-zinc-600" />
              <p className="text-sm leading-6 text-zinc-600">
                Seats are locked for <span className="font-semibold text-zinc-950">10 minutes</span>. Complete payment before the session expires.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-zinc-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-sm text-zinc-500">Payment</span>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-950">
                Secure checkout <ShieldCheck className="size-4 text-zinc-600" />
              </div>
            </div>

            <Button onClick={handleCheckout} disabled={loading} className="h-11 px-6">
              {loading ? "Processing..." : "Proceed to pay"}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
