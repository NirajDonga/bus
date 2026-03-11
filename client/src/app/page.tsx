"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bus, CalendarDays, MapPin, Shield, Clock, Star } from "lucide-react";
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
    <div className="min-h-[calc(100vh-60px)]">
      {/* Hero — Clean, whitish with a red accent strip */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 py-16 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
              Book bus tickets <br />
              <span className="text-[#D84E55]">with ease.</span>
            </h1>
            <p className="text-gray-500 text-base mt-4 max-w-md leading-relaxed">
              India&apos;s No. 1 online bus ticket booking platform. Thousands of routes, instant confirmation.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-10 bg-white border border-gray-200 rounded-xl p-1.5 flex flex-col lg:flex-row items-stretch gap-0 max-w-3xl shadow-sm">
            {/* From */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-100">
              <Bus className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex flex-col w-full">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">From</label>
                <input
                  type="text"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  placeholder="Enter city"
                  className="w-full bg-transparent outline-none text-sm font-medium text-gray-900 placeholder:text-gray-300 mt-0.5"
                  required
                />
              </div>
            </div>

            {/* To */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-100">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex flex-col w-full">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">To</label>
                <input
                  type="text"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  placeholder="Enter city"
                  className="w-full bg-transparent outline-none text-sm font-medium text-gray-900 placeholder:text-gray-300 mt-0.5"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-100">
              <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex flex-col w-full">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Date of Journey</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-medium text-gray-900 mt-0.5"
                  required
                />
              </div>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              className="bg-[#D84E55] hover:bg-[#c4444b] text-white rounded-lg lg:rounded-l-none lg:rounded-r-lg h-auto px-8 py-4 lg:py-0 text-sm font-semibold shrink-0 cursor-pointer"
            >
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Features — clean grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-[#D84E55]" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Safe & Secure</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Book with confidence. Secure payments and verified bus operators across the country.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-[#D84E55]" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Instant Booking</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Get your tickets confirmed instantly. No waiting, no hassle, just book and go.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
              <Star className="w-5 h-5 text-[#D84E55]" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">2000+ Operators</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Choose from a wide range of premium bus operators and find the perfect ride.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
