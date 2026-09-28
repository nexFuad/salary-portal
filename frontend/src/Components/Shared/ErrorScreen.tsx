"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, TriangleAlert } from "lucide-react";

type ErrorScreenProps = {
  code: string;
  title: string;
  description: string;
  retry?: () => void;
  digest?: string;
};

export default function ErrorScreen({
  code,
  title,
  description,
  retry,
  digest,
}: ErrorScreenProps) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[#f4f8f7] px-5 py-16 text-[#202b35]">
      <section className="w-full max-w-xl rounded-3xl border border-[#dfe9e6] bg-white px-6 py-10 text-center shadow-[0_18px_55px_rgba(27,69,63,0.08)] sm:px-12 sm:py-14">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#e8f2ef] text-[#237368]">
          <TriangleAlert size={30} strokeWidth={1.7} aria-hidden="true" />
        </div>
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.22em] text-[#237368]">
          Error {code}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#65737b] sm:text-base">
          {description}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {retry && (
            <button
              type="button"
              onClick={retry}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#236d63] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#195a51] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#236d63]"
            >
              <RotateCcw size={17} aria-hidden="true" /> Try again
            </button>
          )}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#cfded9] px-5 py-2.5 text-sm font-semibold text-[#285e57] transition hover:bg-[#f1f7f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#236d63]"
          >
            <ArrowLeft size={17} aria-hidden="true" /> Go back
          </button>
        </div>
        {code === "404" && (
          <p className="mt-7 text-sm text-[#77838d]">
            Looking for your account?{" "}
            <Link href="/Login" className="font-semibold text-[#236d63] underline underline-offset-4">
              Sign in
            </Link>
          </p>
        )}
        {digest && (
          <p className="mt-7 text-xs text-[#93a0a5]">Reference: {digest}</p>
        )}
      </section>
    </main>
  );
}
