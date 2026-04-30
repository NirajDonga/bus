"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.token) {
        toast.error(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      toast.success("Logged in successfully");
      router.push(redirectTo);
    } catch {
      toast.error("Unable to reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50">
      <div className="page-shell grid min-h-[calc(100vh-64px)] items-center py-10">
        <section className="mx-auto w-full max-w-md overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-6 py-5">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">Login</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Use your Busline account to continue booking.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <label className="block">
              <span className="label mb-2 block">Email</span>
              <span className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 focus-within:border-zinc-950">
                <Mail className="size-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-h-10 flex-1 bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400"
                  placeholder="you@example.com"
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="label mb-2 block">Password</span>
              <span className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 focus-within:border-zinc-950">
                <LockKeyhole className="size-4 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-10 flex-1 bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400"
                  placeholder="Password"
                  required
                />
              </span>
            </label>

            <Button type="submit" disabled={loading} className="h-11 w-full">
              {loading ? "Logging in..." : "Login"}
              {!loading && <ArrowRight className="size-4" />}
            </Button>

            <p className="text-center text-sm text-zinc-500">
              New here?{" "}
              <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="font-medium text-zinc-950 hover:underline">
                Create account
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-zinc-500">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
