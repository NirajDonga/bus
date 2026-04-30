"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const registerResponse = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, phone, password }),
      });
      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        const validationMessage = registerData.errors ? Object.values(registerData.errors).flat().join(" ") : "";
        toast.error(validationMessage || registerData.message || "Signup failed");
        return;
      }

      const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginResponse.json();

      if (loginResponse.ok && loginData.token) {
        localStorage.setItem("token", loginData.token);
        toast.success("Account created");
        router.push(redirectTo);
        return;
      }

      toast.success("Account created. Please login.");
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
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
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">Create account</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Sign up once, then reserve seats and pay faster.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <AuthField label="Full name" icon={<UserRound className="size-4 text-zinc-400" />}>
              <input className="min-h-10 flex-1 bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400" value={fullname} onChange={(event) => setFullname(event.target.value)} placeholder="Your name" required minLength={2} />
            </AuthField>

            <AuthField label="Email" icon={<Mail className="size-4 text-zinc-400" />}>
              <input type="email" className="min-h-10 flex-1 bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            </AuthField>

            <AuthField label="Phone" icon={<Phone className="size-4 text-zinc-400" />}>
              <input type="tel" inputMode="numeric" pattern="\d{10}" className="min-h-10 flex-1 bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="10 digit number" required />
            </AuthField>

            <AuthField label="Password" icon={<LockKeyhole className="size-4 text-zinc-400" />}>
              <input type="password" className="min-h-10 flex-1 bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required minLength={8} />
            </AuthField>

            <Button type="submit" disabled={loading} className="h-11 w-full">
              {loading ? "Creating..." : "Sign up"}
              {!loading && <ArrowRight className="size-4" />}
            </Button>

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="font-medium text-zinc-950 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

function AuthField({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label mb-2 block">{label}</span>
      <span className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 focus-within:border-zinc-950">
        {icon}
        {children}
      </span>
    </label>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-zinc-500">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
