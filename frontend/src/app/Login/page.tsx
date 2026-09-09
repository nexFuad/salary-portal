"use client";

import axios from "axios";
import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/Hooks/useAuth";
import { dashboardPathByRole } from "@/Types/auth";

function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const [employeeId, setEmployeeId] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const logoutMessage = searchParams.get("loggedOut") === "1";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login({ employeeId, company, password, rememberMe });
      window.location.replace(dashboardPathByRole[user.role]);
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : null;
      setError(
        typeof message === "string"
          ? message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f4f8f7] lg:grid-cols-2">
      <section className="hidden bg-[#e4f0ed] p-12 lg:flex lg:flex-col lg:justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 self-start"
          aria-label="SalaryFlow home"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-[#165c55] text-sm font-bold text-white">
            SF
          </span>
          <span className="text-2xl font-semibold tracking-tight text-slate-800">
            SalaryFlow
          </span>
        </Link>
        <div className="max-w-md">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b47a1f]">
            Welcome back
          </p>
          <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-800">
            Payroll, in one clear place.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Sign in to manage salaries, employees, and approvals for your
            organisation.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Secure access for Officer and OM teams.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-12 flex items-center gap-3 lg:hidden"
            aria-label="SalaryFlow home"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[#165c55] text-sm font-bold text-white">
              SF
            </span>
            <span className="text-xl font-semibold text-slate-800">
              SalaryFlow
            </span>
          </Link>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800">
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
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-[#fff1ef] px-4 py-3 text-sm text-[#a43f35]"
                >
                  {error}
                </p>
              )}
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
