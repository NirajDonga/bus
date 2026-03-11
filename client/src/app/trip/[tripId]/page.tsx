"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Armchair, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Suspense } from "react";

function SeatSelectionContent({ tripId }: { tripId: string }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const boardId = searchParams.get("board");
    const dropId = searchParams.get("drop");
    const price = Number(searchParams.get("price")) || 0;

    const [seatMap, setSeatMap] = useState<any>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [passengers, setPassengers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reserving, setReserving] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (!boardId || !dropId) return;

        async function fetchSeats() {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/inventory/${tripId}?from=${boardId}&to=${dropId}`);
                const rs = await res.json();
                if (rs.success && rs.data) {
                    setSeatMap(rs.data);
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        }
        fetchSeats();
    }, [tripId, boardId, dropId]);

    const toggleSeat = (seat: string) => {
        if (selectedSeats.includes(seat)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seat));
            setPassengers(passengers.filter(p => p.seatNumber !== seat));
        } else {
            if (selectedSeats.length >= 6) {
                toast.error("You can select a maximum of 6 seats.");
                return;
            }
            setSelectedSeats([...selectedSeats, seat]);
            setPassengers([...passengers, { seatNumber: seat, name: "", age: 25, gender: "male" }]);
        }
    };

    const handlePassengerChange = (seat: string, field: string, value: string | number) => {
        setPassengers(passengers.map(p => p.seatNumber === seat ? { ...p, [field]: value } : p));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok && data.token) {
                localStorage.setItem("token", data.token);
                toast.success("Logged in successfully");
                setShowLogin(false);
                handleReserve();
            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch {
            toast.error("Login failed");
        }
    };

    const handleReserve = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setShowLogin(true);
            return;
        }

        if (passengers.some(p => !p.name || p.name.length < 2)) {
            toast.error("Please fill in all passenger names");
            return;
        }

        setReserving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/bookings/reserve`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    tripId: Number(tripId),
                    boardingStationId: Number(boardId),
                    droppingStationId: Number(dropId),
                    seatNumbers: selectedSeats,
                    passengers: passengers
                })
            });
            const data = await res.json();
            if (res.ok && data.bookingId) {
                toast.success("Seats reserved! Redirecting to payment...");
                router.push(`/book/${data.bookingId}`);
            } else {
                toast.error(data.message || "Failed to reserve seats");
            }
        } catch {
            toast.error("Network error");
        }
        setReserving(false);
    };

    if (!boardId || !dropId) {
        return <div className="text-center py-20 text-gray-400 text-sm">Invalid route parameters.</div>;
    }

    return (
        <div className="min-h-[calc(100vh-60px)]">
            {/* Sub Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-[1200px] mx-auto px-6 h-[48px] flex items-center gap-3">
                    <Link href="/search" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                    <span className="text-sm font-medium text-gray-900">Select Seats</span>
                    <span className="text-xs text-gray-400">— Trip #{tripId}</span>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col md:flex-row gap-6">
                {/* Left: Seat Map */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                            <Armchair className="w-4 h-4 text-[#D84E55]" />
                            <span className="text-sm font-semibold text-gray-900">Choose your seats</span>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="flex flex-col items-center gap-3 py-12">
                                    <div className="w-6 h-6 border-2 border-[#D84E55] border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs text-gray-400">Loading seat map...</span>
                                </div>
                            ) : seatMap ? (
                                <div className="flex flex-col items-center">
                                    {/* Seat Grid */}
                                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-5 w-fit relative">
                                        {/* Driver indicator */}
                                        <div className="absolute right-3 top-2">
                                            <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-gray-300" />
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-col gap-2">
                                            {seatMap.layout.map((row: any[], rIdx: number) => (
                                                <div key={rIdx} className="flex gap-2 justify-center">
                                                    {row.map((seat: string | null, sIdx: number) => {
                                                        if (!seat) return <div key={sIdx} className="w-10 h-10" />;

                                                        const status = seatMap.seats[seat] as "available" | "locked" | "booked";
                                                        const isSelected = selectedSeats.includes(seat);

                                                        let classes = "bg-white border-gray-200 text-gray-600 hover:border-[#D84E55] cursor-pointer";
                                                        if (status === "booked" || status === "locked") classes = "bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed";
                                                        if (isSelected) classes = "bg-[#D84E55] border-[#D84E55] text-white";

                                                        return (
                                                            <button
                                                                key={seat}
                                                                disabled={status !== "available"}
                                                                onClick={() => toggleSeat(seat)}
                                                                className={`w-10 h-10 border rounded-md text-xs font-semibold transition-colors flex items-center justify-center ${classes}`}
                                                            >
                                                                {seat}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex gap-5 mt-5 text-[11px] text-gray-400 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3.5 h-3.5 rounded border border-gray-200 bg-white" /> Available
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3.5 h-3.5 rounded bg-[#D84E55]" /> Selected
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3.5 h-3.5 rounded bg-gray-100" /> Booked
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-400 py-12 text-center text-sm">Failed to load seat map.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Passenger Details */}
                <div className="w-full md:w-[360px] shrink-0">
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-[120px]">
                        <div className="px-5 py-3 border-b border-gray-100">
                            <span className="text-sm font-semibold text-gray-900">Passenger Details</span>
                        </div>

                        <div className="p-5 max-h-[50vh] overflow-y-auto">
                            {selectedSeats.length === 0 ? (
                                <div className="text-gray-400 text-xs text-center py-10">
                                    Select seats to continue
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {passengers.map((p) => (
                                        <div key={p.seatNumber} className="border border-gray-100 rounded-lg p-3 relative">
                                            <div className="absolute -top-2.5 left-3 bg-[#D84E55] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                {p.seatNumber}
                                            </div>
                                            <div className="mt-2 flex flex-col gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    value={p.name}
                                                    onChange={e => handlePassengerChange(p.seatNumber, "name", e.target.value)}
                                                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#D84E55] transition-colors"
                                                    required
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder="Age"
                                                        value={p.age}
                                                        onChange={e => handlePassengerChange(p.seatNumber, "age", Number(e.target.value))}
                                                        className="w-16 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#D84E55] transition-colors"
                                                        required min={1} max={100}
                                                    />
                                                    <select
                                                        value={p.gender}
                                                        onChange={e => handlePassengerChange(p.seatNumber, "gender", e.target.value)}
                                                        className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#D84E55] bg-white cursor-pointer transition-colors"
                                                    >
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 p-5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-500">Total</span>
                                <span className="text-xl font-bold text-gray-900">₹{price * selectedSeats.length}</span>
                            </div>
                            <Button
                                disabled={selectedSeats.length === 0 || reserving}
                                onClick={handleReserve}
                                className="w-full bg-[#D84E55] hover:bg-[#c4444b] text-white text-sm font-semibold h-11 rounded-lg cursor-pointer"
                            >
                                {reserving ? "Processing..." : "Proceed to Book"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Modal */}
            {showLogin && (
                <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden border border-gray-100 shadow-lg">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-base font-semibold text-gray-900">Login to continue</h3>
                        </div>
                        <form onSubmit={handleLogin} className="p-6 flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Email"
                                className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-[#D84E55] transition-colors"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-[#D84E55] transition-colors"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <Button type="submit" className="bg-[#D84E55] hover:bg-[#c4444b] text-white text-sm font-semibold h-10 rounded-lg mt-1 cursor-pointer">
                                Login & Book
                            </Button>
                            <button
                                type="button"
                                onClick={() => setShowLogin(false)}
                                className="text-xs text-gray-400 hover:text-gray-600 mt-1 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SeatSelectionPage({ params }: { params: Promise<{ tripId: string }> }) {
    const { tripId } = use(params);
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-[#D84E55] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SeatSelectionContent tripId={tripId} />
        </Suspense>
    );
}
