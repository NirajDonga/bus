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
        <div className="min-h-[calc(100vh-60px)] flex items-start justify-center pt-12 px-6">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h1 className="text-lg font-semibold text-gray-900">Review Booking</h1>
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                            Reference: <span className="font-mono text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded text-xs">#{bookingId}</span>
                        </p>
                    </div>

                    {/* Route Visualization */}
                    <div className="px-6 py-5">
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                            <div className="flex justify-between items-center relative">
                                <div className="z-10">
                                    <p className="text-[10px] font-medium uppercase text-gray-400 tracking-wider">Boarding</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">Station A</p>
                                </div>

                                <div className="hidden sm:flex absolute left-20 right-20 top-1/2 -translate-y-1/2 items-center justify-center">
                                    <div className="h-px w-full border-t border-dashed border-gray-300 relative">
                                        <Bus className="w-4 h-4 text-[#D84E55] absolute left-1/2 -top-2 -translate-x-1/2 bg-gray-50 px-0.5" />
                                    </div>
                                </div>

                                <div className="z-10 text-right">
                                    <p className="text-[10px] font-medium uppercase text-gray-400 tracking-wider">Dropping</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">Station B</p>
                                </div>
                            </div>
                        </div>

                        {/* Timer Warning */}
                        <div className="mt-4 flex items-start gap-2.5 bg-amber-50 rounded-lg p-3 border border-amber-100">
                            <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 leading-relaxed">
                                Seats are locked for <strong>10 minutes</strong>. Complete your payment before the session expires.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <span className="text-xs text-gray-400">Total Payable</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-sm font-semibold text-gray-900">Secure Payment</span>
                                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                            </div>
                        </div>

                        <Button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full sm:w-auto bg-[#D84E55] hover:bg-[#c4444b] text-white px-6 h-11 text-sm font-semibold rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                            {loading ? "Processing..." : "Proceed to Pay"}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
