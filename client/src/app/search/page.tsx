"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bus, MapPin, SearchX, Star, ShieldCheck, CalendarDays, Search } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Form State
    const [fromInput, setFromInput] = useState(searchParams.get("from_city") || "");
    const [toInput, setToInput] = useState(searchParams.get("to_city") || "");
    const [dateInput, setDateInput] = useState(searchParams.get("date") || "");

    // Search Result State
    const fromCity = searchParams.get("from_city");
    const toCity = searchParams.get("to_city");
    const date = searchParams.get("date");
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fromInput && toInput && dateInput) {
            router.push(`/search?from_city=${encodeURIComponent(fromInput)}&to_city=${encodeURIComponent(toInput)}&date=${encodeURIComponent(dateInput)}`);
        }
    };

    useEffect(() => {
        if (!fromCity || !toCity || !date) return;

        async function fetchTrips() {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/search?from_city=${fromCity}&to_city=${toCity}&date=${date}`);
                const rs = await res.json();
                if (rs && rs.data) {
                    setTrips(rs.data);
                } else {
                    setTrips([]);
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        }

        fetchTrips();
    }, [fromCity, toCity, date]);

    return (
        <div className="min-h-[calc(100vh-60px)]">
            {/* Search Bar — sticky white bar like RedBus */}
            <div className="bg-white border-b border-gray-100 sticky top-[60px] z-40">
                <div className="max-w-[1200px] mx-auto px-6">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-0 h-[56px]">
                        {/* From */}
                        <div className="flex items-center gap-2.5 pr-6 border-r border-gray-200 h-full">
                            <Bus className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-none">From</span>
                                <input
                                    type="text"
                                    value={fromInput}
                                    onChange={(e) => setFromInput(e.target.value)}
                                    placeholder="City"
                                    className="bg-transparent outline-none text-sm font-semibold text-gray-900 placeholder:text-gray-300 w-36 mt-0.5"
                                    required
                                />
                            </div>
                        </div>

                        {/* Swap */}
                        <button
                            type="button"
                            onClick={() => { setFromInput(toInput); setToInput(fromInput); }}
                            className="mx-3 w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors shrink-0 cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 16 4 4 4-4" /><path d="M11 20V4" /><path d="m17 8-4-4-4 4" /><path d="M13 4v16" /></svg>
                        </button>

                        {/* To */}
                        <div className="flex items-center gap-2.5 pr-6 border-r border-gray-200 h-full">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-none">To</span>
                                <input
                                    type="text"
                                    value={toInput}
                                    onChange={(e) => setToInput(e.target.value)}
                                    placeholder="City"
                                    className="bg-transparent outline-none text-sm font-semibold text-gray-900 placeholder:text-gray-300 w-36 mt-0.5"
                                    required
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2.5 px-6 h-full">
                            <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-none">Date of journey</span>
                                <input
                                    type="date"
                                    value={dateInput}
                                    onChange={(e) => setDateInput(e.target.value)}
                                    className="bg-transparent outline-none text-sm font-semibold text-gray-900 mt-0.5"
                                    required
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <button
                            type="submit"
                            className="ml-auto w-10 h-10 rounded-full bg-[#D84E55] hover:bg-[#c4444b] text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-[1200px] mx-auto px-6 py-6">
                {!fromCity || !toCity || !date ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                            <Bus className="w-7 h-7 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Search for buses</h3>
                        <p className="text-sm text-gray-400 text-center max-w-xs">
                            Enter your boarding point, destination, and travel date to find available buses.
                        </p>
                    </div>
                ) : loading ? (
                    /* Loading Skeletons */
                    <div>
                        <div className="mb-6">
                            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-100 h-[140px] animate-pulse" />
                            ))}
                        </div>
                    </div>
                ) : trips.length === 0 ? (
                    /* No Results */
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                            <SearchX className="w-7 h-7 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No buses found</h3>
                        <p className="text-sm text-gray-400 text-center max-w-xs">
                            We couldn&apos;t find any buses for this route on the selected date. Try a different date or route.
                        </p>
                    </div>
                ) : (
                    /* Results */
                    <div>
                        {/* Route Header */}
                        <div className="mb-6">
                            <h2 className="text-base font-semibold text-gray-900">
                                From {fromCity} to {toCity}
                            </h2>
                            <p className="text-sm text-[#D84E55] mt-0.5">
                                {trips.length} bus{trips.length !== 1 ? "es" : ""} found
                            </p>
                        </div>

                        {/* Trip Cards */}
                        <div className="space-y-3">
                            {trips.map((trip) => {
                                const boardStop = trip.schedule.find((s: any) => s.city.toLowerCase() === fromCity!.toLowerCase());
                                const dropStop = trip.schedule.find((s: any) => s.city.toLowerCase() === toCity!.toLowerCase());
                                const price = dropStop?.price - boardStop?.price || 0;

                                const departTime = boardStop?.arrival_time?.slice(11, 16) || "--:--";
                                const arriveTime = dropStop?.arrival_time?.slice(11, 16) || "--:--";

                                return (
                                    <div
                                        key={trip.id}
                                        className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors overflow-hidden"
                                    >
                                        <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                            {/* Operator Info */}
                                            <div className="sm:w-[200px] shrink-0">
                                                <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                                    {trip.operator_name || "Premium Express"}
                                                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                                                </div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    Volvo A/C Sleeper (2+1)
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className="hidden sm:flex items-center shrink-0">
                                                <div className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span>4.5</span>
                                                </div>
                                            </div>

                                            {/* Times */}
                                            <div className="flex-1 flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-900 leading-none">{departTime}</div>
                                                    <div className="text-[11px] text-gray-400 mt-0.5 uppercase">{boardStop?.city}</div>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-gray-300 px-2">
                                                    <div className="h-px w-6 bg-gray-200" />
                                                    <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">10h 30m</span>
                                                    <div className="h-px w-6 bg-gray-200" />
                                                </div>

                                                <div>
                                                    <div className="text-lg font-bold text-gray-900 leading-none">{arriveTime}</div>
                                                    <div className="text-[11px] text-gray-400 mt-0.5 uppercase">{dropStop?.city}</div>
                                                </div>
                                            </div>

                                            {/* Price + CTA */}
                                            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-900">₹{price}</div>
                                                    <div className="text-[10px] text-gray-400">Onwards</div>
                                                </div>
                                                <Link href={`/trip/${trip.id}?board=${boardStop?.stop_id}&drop=${dropStop?.stop_id}&price=${price}`}>
                                                    <Button className="bg-[#D84E55] hover:bg-[#c4444b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg h-auto cursor-pointer">
                                                        View seats
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-[#D84E55] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SearchResultsContent />
        </Suspense>
    );
}
