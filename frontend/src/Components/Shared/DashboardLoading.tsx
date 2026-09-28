import { LoaderCircle } from "lucide-react";

export default function DashboardLoading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-[#f4f8f7] px-6"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#dceae6] bg-white px-10 py-9 text-center shadow-sm">
        <div className="grid size-14 place-items-center rounded-full bg-[#e7f0ee] text-[#17665c]">
          <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
        </div>
        <div>
          <p className="text-base font-semibold text-[#202b35]">Loading your dashboard</p>
          <p className="mt-1 text-sm text-[#77838d]">Checking your session…</p>
        </div>
      </div>
    </main>
  );
}
