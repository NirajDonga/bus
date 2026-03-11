"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function BookingFailedPage() {
    return (
        <div className="min-h-[calc(100vh-60px)] flex items-start justify-center pt-16 px-6">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden text-center">
                    <div className="px-8 py-10">
                        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
                            <AlertCircle className="w-7 h-7 text-[#D84E55]" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900">Payment Failed</h1>
                        <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
                            Your checkout session expired or the payment could not be processed. Locked seats have been released.
                        </p>
                    </div>

                    <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50">
                        <Link href="/">
                            <Button className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold h-10 px-6 rounded-lg cursor-pointer">
                                <RefreshCw className="w-4 h-4 mr-1.5" />
                                Search Again
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
