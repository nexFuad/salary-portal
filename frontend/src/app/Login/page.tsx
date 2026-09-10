"use client";

import axios from "axios";
import Link from "next/link";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/Hooks/useAuth";
import { useToast } from "@/Components/Shared/Toast";
import { dashboardPathByRole } from "@/Types/auth";

function LoginForm() {
  const { login, user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [employeeId, setEmployeeId] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const logoutMessage = searchParams.get("loggedOut") === "1";

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(dashboardPathByRole[user.role]);
    }
  }, [isLoading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await login({ employeeId, company, password, rememberMe });
      showToast("Login successful. Redirecting to your dashboard…", "success");
      router.replace(dashboardPathByRole[user.role]);
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : null;
      showToast(
        typeof message === "string"
          ? message
          : "Unable to sign in. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#f4f8f7]">
      <section className="flex min-h-screen items-center justify-center px-5 py-24 sm:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-semibold text-[#2f766d] transition hover:text-[#165c55]"
            >
              ← Back to home
            </Link>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-800">
              Sign in
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Use your employee account details to continue.
            </p>
            {logoutMessage && (
              <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                You have been logged out successfully.
              </p>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-slate-700">
                Employee ID
                <input
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2f766d] focus:ring-4 focus:ring-[#d8eae6]"
                  placeholder="Enter your employee ID"
                  autoComplete="username"
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Company
                <input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2f766d] focus:ring-4 focus:ring-[#d8eae6]"
                  placeholder="Enter your company"
                  autoComplete="organization"
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Password
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2f766d] focus:ring-4 focus:ring-[#d8eae6]"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                <input
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="size-4 rounded border-slate-300 accent-[#165c55]"
                  type="checkbox"
                />
                Remember me on this device
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[#2f766d] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#165c55] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
