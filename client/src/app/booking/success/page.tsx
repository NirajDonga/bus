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
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden text-center">
            <div className="px-8 py-10">
                <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Booking Confirmed</h1>
                <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                    Your payment was successful and seats have been reserved.
                </p>

                {bookingId && (
                    <div className="mt-6 bg-gray-50 rounded-lg border border-gray-100 p-4 inline-block">
                        <span className="text-[10px] font-medium uppercase text-gray-400 tracking-wider block mb-1">Booking ID</span>
                        <span className="font-mono text-lg font-bold text-gray-900">#{bookingId}</span>
                    </div>
                )}
            </div>

            <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50">
                <Link href="/">
                    <Button className="bg-[#D84E55] hover:bg-[#c4444b] text-white text-sm font-semibold h-10 px-6 rounded-lg cursor-pointer">
                        <Ticket className="w-4 h-4 mr-1.5" />
                        View My Tickets
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <div className="min-h-[calc(100vh-60px)] flex items-start justify-center pt-16 px-6">
            <div className="w-full max-w-md">
                <Suspense fallback={<div className="text-center text-sm text-gray-400 py-10">Loading...</div>}>
                    <SuccessContent />
                </Suspense>
            </div>
        </div>
    );
}
