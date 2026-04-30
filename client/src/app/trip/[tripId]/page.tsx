"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Armchair, ArrowRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type SeatStatus = "available" | "locked" | "booked";

type SeatMap = {
  layout: (string | null)[][];
  seats: Record<string, SeatStatus>;
};

type Passenger = {
  seatNumber: string;
  name: string;
  age: number;
  gender: "male" | "female";
};

function SeatSelectionContent({ tripId }: { tripId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const boardId = searchParams.get("board");
  const dropId = searchParams.get("drop");
  const price = Number(searchParams.get("price")) || 0;

  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
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
        if (rs.success && rs.data) setSeatMap(rs.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    fetchSeats();
  }, [tripId, boardId, dropId]);

  const toggleSeat = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
      setPassengers(passengers.filter((p) => p.seatNumber !== seat));
      return;
    }

    if (selectedSeats.length >= 6) {
      toast.error("You can select a maximum of 6 seats.");
      return;
    }

    setSelectedSeats([...selectedSeats, seat]);
    setPassengers([...passengers, { seatNumber: seat, name: "", age: 25, gender: "male" }]);
  };

  const handlePassengerChange = (seat: string, field: string, value: string | number) => {
    setPassengers(passengers.map((p) => (p.seatNumber === seat ? { ...p, [field]: value } : p)));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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

    if (passengers.some((p) => !p.name || p.name.length < 2)) {
      toast.error("Please fill in all passenger names");
      return;
    }

    setReserving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/bookings/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tripId: Number(tripId),
          boardingStationId: Number(boardId),
          droppingStationId: Number(dropId),
          seatNumbers: selectedSeats,
          passengers,
        }),
      });
      const data = await res.json();
      const bookingId = data?.data?.bookingId || data?.bookingId;
      if (res.ok && bookingId) {
        toast.success("Seats reserved. Redirecting to payment.");
        router.push(`/book/${bookingId}`);
      } else {
        toast.error(data.message || "Failed to reserve seats");
      }
    } catch {
      toast.error("Network error");
    }
    setReserving(false);
  };

  if (!boardId || !dropId) {
    return <div className="py-20 text-center text-sm text-zinc-500">Invalid route parameters.</div>;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="page-shell flex h-14 items-center gap-3">
          <Link href="/search" className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950">
            <ChevronLeft className="size-4" />
          </Link>
          <span className="text-sm font-semibold text-zinc-950">Select seats</span>
          <span className="text-sm text-zinc-500">Trip #{tripId}</span>
        </div>
      </div>

      <div className="page-shell grid gap-6 py-6 lg:grid-cols-[1fr_380px]">
        <section className="surface overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-4">
            <Armchair className="size-4 text-zinc-950" />
            <h1 className="text-sm font-semibold text-zinc-950">Choose your seats</h1>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-14 text-center text-sm text-zinc-500">Loading seat map...</div>
            ) : seatMap ? (
              <div className="flex flex-col items-center">
                <div className="relative w-fit rounded-lg border border-zinc-200 bg-zinc-50 p-5">
                  <div className="absolute right-4 top-4 size-7 rounded-full border-2 border-zinc-300" />
                  <div className="mt-8 flex flex-col gap-2">
                    {seatMap.layout.map((row, rIdx) => (
                      <div key={rIdx} className="flex justify-center gap-2">
                        {row.map((seat: string | null, sIdx: number) => {
                          if (!seat) return <div key={sIdx} className="size-10" />;

                          const status = seatMap.seats[seat] as "available" | "locked" | "booked";
                          const isSelected = selectedSeats.includes(seat);
                          const disabled = status !== "available";

                          return (
                            <button
                              key={seat}
                              disabled={disabled}
                              onClick={() => toggleSeat(seat)}
                              className={[
                                "flex size-10 items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                                disabled ? "border-zinc-200 bg-zinc-200 text-zinc-400" : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-950",
                                isSelected ? "border-zinc-950 bg-zinc-950 text-white" : "",
                              ].join(" ")}
                            >
                              {seat}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-5 text-xs text-zinc-500">
                  <Legend label="Available" className="border-zinc-300 bg-white" />
                  <Legend label="Selected" className="border-zinc-950 bg-zinc-950" />
                  <Legend label="Booked" className="border-zinc-200 bg-zinc-200" />
                </div>
              </div>
            ) : (
              <div className="py-14 text-center text-sm text-zinc-500">Failed to load seat map.</div>
            )}
          </div>
        </section>

        <aside className="surface h-fit overflow-hidden lg:sticky lg:top-24">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-950">Passenger details</h2>
          </div>

          <div className="max-h-[50vh] overflow-y-auto p-5">
            {selectedSeats.length === 0 ? (
              <div className="py-10 text-center text-sm text-zinc-500">Select seats to continue.</div>
            ) : (
              <div className="space-y-4">
                {passengers.map((p) => (
                  <div key={p.seatNumber} className="rounded-lg border border-zinc-200 p-4">
                    <div className="mb-3 inline-flex rounded-md bg-zinc-950 px-2 py-1 text-xs font-semibold text-white">
                      Seat {p.seatNumber}
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Full name"
                        value={p.name}
                        onChange={(e) => handlePassengerChange(p.seatNumber, "name", e.target.value)}
                        className="field"
                        required
                      />
                      <div className="grid grid-cols-[90px_1fr] gap-3">
                        <input
                          type="number"
                          placeholder="Age"
                          value={p.age}
                          onChange={(e) => handlePassengerChange(p.seatNumber, "age", Number(e.target.value))}
                          className="field"
                          required
                          min={1}
                          max={100}
                        />
                        <select
                          value={p.gender}
                          onChange={(e) => handlePassengerChange(p.seatNumber, "gender", e.target.value)}
                          className="field"
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

          <div className="border-t border-zinc-200 p-5">
            <div className="mb-4 flex items-end justify-between">
              <span className="text-sm text-zinc-500">Total</span>
              <span className="text-2xl font-semibold text-zinc-950">Rs {price * selectedSeats.length}</span>
            </div>
            <Button disabled={selectedSeats.length === 0 || reserving} onClick={handleReserve} className="h-11 w-full">
              {reserving ? "Processing..." : "Proceed to book"}
              {!reserving && <ArrowRight className="size-4" />}
            </Button>
          </div>
        </aside>
      </div>

      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/50 p-4">
          <div className="w-full max-w-sm overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h3 className="text-base font-semibold text-zinc-950">Login to continue</h3>
            </div>
            <form onSubmit={handleLogin} className="flex flex-col gap-3 p-6">
              <input type="email" placeholder="Email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" className="mt-1 h-10">Login and book</Button>
              <Link
                href={`/signup?redirect=${encodeURIComponent(`/trip/${tripId}?${searchParams.toString()}`)}`}
                className="text-center text-sm font-medium text-zinc-950 transition-colors hover:underline"
              >
                Create account
              </Link>
              <button type="button" onClick={() => setShowLogin(false)} className="text-sm text-zinc-500 transition-colors hover:text-zinc-950">
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-3 rounded border ${className}`} />
      {label}
    </div>
  );
}

export default function SeatSelectionPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-zinc-500">Loading...</div>}>
      <SeatSelectionContent tripId={tripId} />
    </Suspense>
  );
}
