"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bus, CalendarDays, MapPin, Search, SearchX, ShieldCheck } from "lucide-react";
import Link from "next/link";

type Stop = {
  city: string;
  stop_id: number;
  price: number;
  arrival_time?: string;
};

type Trip = {
  id: number | string;
  operator_name?: string;
  schedule: Stop[];
};

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [fromInput, setFromInput] = useState(searchParams.get("from_city") || "");
  const [toInput, setToInput] = useState(searchParams.get("to_city") || "");
  const [dateInput, setDateInput] = useState(searchParams.get("date") || "");

  const fromCity = searchParams.get("from_city");
  const toCity = searchParams.get("to_city");
  const date = searchParams.get("date");
  const [trips, setTrips] = useState<Trip[]>([]);
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
        setTrips(rs?.data || []);
      } catch (err) {
        console.error(err);
        setTrips([]);
      }
      setLoading(false);
    }

    fetchTrips();
  }, [fromCity, toCity, date]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50">
      <div className="sticky top-16 z-40 border-b border-zinc-200 bg-white">
        <div className="page-shell py-3">
          <form onSubmit={handleSearchSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
            <label className="flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-2">
              <Bus className="size-4 text-zinc-500" />
              <span className="min-w-0 flex-1">
                <span className="label block">From</span>
                <input
                  type="text"
                  value={fromInput}
                  onChange={(e) => setFromInput(e.target.value)}
                  placeholder="City"
                  className="w-full bg-transparent text-sm font-medium text-zinc-950 outline-none placeholder:text-zinc-400"
                  required
                />
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-2">
              <MapPin className="size-4 text-zinc-500" />
              <span className="min-w-0 flex-1">
                <span className="label block">To</span>
                <input
                  type="text"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  placeholder="City"
                  className="w-full bg-transparent text-sm font-medium text-zinc-950 outline-none placeholder:text-zinc-400"
                  required
                />
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-2">
              <CalendarDays className="size-4 text-zinc-500" />
              <span className="min-w-0 flex-1">
                <span className="label block">Date</span>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-zinc-950 outline-none"
                  required
                />
              </span>
            </label>

            <Button type="submit" className="h-12 px-5">
              <Search className="size-4" />
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="page-shell py-8">
        {!fromCity || !toCity || !date ? (
          <EmptyState icon={Bus} title="Search for buses" text="Enter your route and travel date to see available departures." />
        ) : loading ? (
          <div>
            <div className="mb-5 h-5 w-56 animate-pulse rounded bg-zinc-200" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-lg border border-zinc-200 bg-white" />
              ))}
            </div>
          </div>
        ) : trips.length === 0 ? (
          <EmptyState icon={SearchX} title="No buses found" text="Try another date or adjust your route." />
        ) : (
          <div>
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="label">Available departures</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
                  {fromCity} to {toCity}
                </h1>
              </div>
              <p className="text-sm text-zinc-500">{trips.length} bus{trips.length !== 1 ? "es" : ""} found</p>
            </div>

            <div className="space-y-3">
              {trips.map((trip) => {
                const boardStop = trip.schedule.find((s) => s.city.toLowerCase() === fromCity!.toLowerCase());
                const dropStop = trip.schedule.find((s) => s.city.toLowerCase() === toCity!.toLowerCase());
                const price = dropStop && boardStop ? dropStop.price - boardStop.price : 0;
                const departTime = boardStop?.arrival_time?.slice(11, 16) || "--:--";
                const arriveTime = dropStop?.arrival_time?.slice(11, 16) || "--:--";

                return (
                  <div key={trip.id} className="surface p-5 transition-colors hover:border-zinc-400">
                    <div className="grid gap-5 lg:grid-cols-[220px_1fr_auto] lg:items-center">
                      <div>
                        <div className="flex items-center gap-2 text-base font-semibold text-zinc-950">
                          {trip.operator_name || "Premium Express"}
                          <ShieldCheck className="size-4 text-zinc-600" />
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">A/C Sleeper 2+1</p>
                      </div>

                      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                        <div>
                          <div className="text-2xl font-semibold text-zinc-950">{departTime}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">{boardStop?.city}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="h-px flex-1 bg-zinc-200" />
                          <Bus className="size-4 text-zinc-400" />
                          <span className="h-px flex-1 bg-zinc-200" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold text-zinc-950">{arriveTime}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">{dropStop?.city}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-5 lg:justify-end">
                        <div className="lg:text-right">
                          <div className="text-xl font-semibold text-zinc-950">Rs {price}</div>
                          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">Onwards</div>
                        </div>
                        <Button asChild>
                          <Link href={`/trip/${trip.id}?board=${boardStop?.stop_id}&drop=${dropStop?.stop_id}&price=${price}`}>
                            View seats <ArrowRight className="size-4" />
                          </Link>
                        </Button>
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

function EmptyState({ icon: Icon, title, text }: { icon: typeof Bus; title: string; text: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-lg border border-zinc-200 bg-white">
        <Icon className="size-6 text-zinc-500" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-zinc-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-zinc-500">Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
