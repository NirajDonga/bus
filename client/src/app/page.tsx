"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bus, CalendarDays, MapPin, ShieldCheck, Sparkles, TicketCheck } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to && date) {
      router.push(`/search?from_city=${encodeURIComponent(from)}&to_city=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <section className="page-shell grid gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-700">
            <Sparkles className="size-3.5 text-zinc-950" />
            Clean bus booking
          </div>

          <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
            Book buses without the clutter.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
            Search routes, compare departures, choose seats, and complete payment in a calm black and white workspace.
          </p>

          <form onSubmit={handleSearch} className="surface mt-10 grid gap-0 overflow-hidden lg:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="flex min-h-20 items-center gap-3 border-b border-zinc-200 px-4 lg:border-b-0 lg:border-r">
              <Bus className="size-5 text-zinc-500" />
              <span className="min-w-0 flex-1">
                <span className="label block">From</span>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Bengaluru"
                  className="mt-1 w-full bg-transparent text-base font-medium text-zinc-950 outline-none placeholder:text-zinc-400"
                  required
                />
              </span>
            </label>

            <label className="flex min-h-20 items-center gap-3 border-b border-zinc-200 px-4 lg:border-b-0 lg:border-r">
              <MapPin className="size-5 text-zinc-500" />
              <span className="min-w-0 flex-1">
                <span className="label block">To</span>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Mysuru"
                  className="mt-1 w-full bg-transparent text-base font-medium text-zinc-950 outline-none placeholder:text-zinc-400"
                  required
                />
              </span>
            </label>

            <label className="flex min-h-20 items-center gap-3 border-b border-zinc-200 px-4 lg:border-b-0 lg:border-r">
              <CalendarDays className="size-5 text-zinc-500" />
              <span className="min-w-0 flex-1">
                <span className="label block">Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full bg-transparent text-base font-medium text-zinc-950 outline-none"
                  required
                />
              </span>
            </label>

            <Button type="submit" className="m-2 h-14 rounded-md px-6 text-base">
              Search <ArrowRight className="size-4" />
            </Button>
          </form>
        </div>

        <div className="surface overflow-hidden bg-zinc-950 text-white">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Tonight&apos;s board</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-950">Live</span>
            </div>
          </div>
          <div className="divide-y divide-white/10">
            {[
              ["BLR", "MYS", "21:40", "Rs 520"],
              ["BLR", "HYD", "22:15", "Rs 1,180"],
              ["BLR", "CHN", "23:05", "Rs 940"],
            ].map(([fromCode, toCode, time, price]) => (
              <div key={`${fromCode}-${toCode}`} className="grid grid-cols-[1fr_auto] gap-5 px-6 py-6">
                <div>
                  <div className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
                    <span>{fromCode}</span>
                    <span className="h-px w-8 bg-zinc-500" />
                    <span>{toCode}</span>
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">Departure {time}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{price}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Onwards</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50">
        <div className="page-shell grid gap-4 py-10 md:grid-cols-3">
          {[
            [ShieldCheck, "Verified operators", "Routes and buses are kept direct, readable, and easy to compare."],
            [TicketCheck, "Fast checkout", "Seat selection, passenger details, and payment flow stay focused."],
            [Bus, "Simple route search", "A quiet interface for repeat booking without visual noise."],
          ].map(([Icon, title, text]) => {
            const LucideIcon = Icon as typeof ShieldCheck;
            return (
              <div key={title as string} className="surface p-5">
                <LucideIcon className="size-5 text-zinc-950" />
                <h3 className="mt-4 text-sm font-semibold text-zinc-950">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{text as string}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
