"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  HandCoins,
  WalletCards,
} from "lucide-react";
import OmPageShell from "@/Components/OM/OmPageShell";
import TableSkeleton from "@/Components/Shared/TableSkeleton";
import { useAuth } from "@/Hooks/useAuth";
import { attendanceService } from "@/Services/attendance.services";
import { leaveRequestService } from "@/Services/leave-request.services";
import {
  loanService,
  salaryAdvanceService,
} from "@/Services/om.services";
import { documentService } from "@/Services/document.services";

const time = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(value))
    : "—";
const hours = (start: string, end: string | null) => {
  if (!end) return "In progress";
  const minutes = Math.max(
    0,
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000),
  );
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const dashboard = useQuery({
    queryKey: ["om-dashboard"],
    queryFn: async () => {
      const [leave, attendance, documents, advances, loans] = await Promise.all(
        [
          leaveRequestService.list(),
          attendanceService.list(),
          documentService.list(),
          salaryAdvanceService.list(),
          loanService.list(),
        ],
      );
      return { leave, attendance, documents, advances, loans };
    },
  });
  if (dashboard.isPending)
    return (
      <OmPageShell title="Dashboard" subtitle="Your personal work overview.">
        <TableSkeleton rows={5} />
      </OmPageShell>
    );
  if (dashboard.isError || !dashboard.data)
    return (
      <OmPageShell title="Dashboard" subtitle="Your personal work overview.">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          Could not load dashboard data.
        </div>
      </OmPageShell>
    );
  const { leave, attendance, documents, advances, loans } = dashboard.data;
  const active = attendance.find((record) => !record.checkOutAt);
  const pending =
    leave.filter((r) => r.status === "PENDING").length +
    advances.filter((r) => r.status === "PENDING").length +
    loans.filter((r) => r.status === "PENDING").length;
  const cards = [
    [
      "Today",
      active ? "Checked in" : "Not checked in",
      CheckCircle2,
      "bg-emerald-50 text-emerald-600",
    ],
    [
      "Working hours",
      active ? hours(active.checkInAt, active.checkOutAt) : "—",
      Clock3,
      "bg-amber-50 text-amber-600",
    ],
    [
      "Pending requests",
      String(pending),
      HandCoins,
      "bg-violet-50 text-violet-600",
    ],
    [
      "Documents",
      String(documents.length),
      FileText,
      "bg-[#e7f0ee] text-[#17665c]",
    ],
  ];
  const activity = [
    ...leave.map((r) => ({
      id: `leave-${r.id}`,
      title: "Leave request",
      detail: `${r.leaveType} · ${r.status.toLowerCase()}`,
      date: r.updatedAt,
    })),
    ...advances.map((r) => ({
      id: `salary-advance-${r.id}`,
      title: "Salary advance",
      detail: `৳${r.requestedAmount} · ${r.status.toLowerCase()}`,
      date: r.updatedAt,
    })),
    ...loans.map((r) => ({
      id: `loan-${r.id}`,
      title: "Loan request",
      detail: `${r.loanType} · ${r.status.toLowerCase()}`,
      date: r.updatedAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);
  return (
    <OmPageShell
      title={`Hello, ${user?.name?.split(" ")[0] ?? "there"}`}
      subtitle="Here is a live overview of your workday."
    >
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, value, Icon, color]) => {
          const CardIcon = Icon as typeof CalendarDays;
          return (
            <article
              key={label as string}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  {label as string}
                </span>
                <span className={`rounded-lg p-2 ${color as string}`}>
                  <CardIcon size={17} />
                </span>
              </div>
              <p className="text-xl font-bold text-slate-800">
                {value as string}
              </p>
            </article>
          );
        })}
      </section>
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-800">Recent activity</h2>
          </div>
          {activity.length ? (
            activity.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 border-b border-slate-100 px-5 py-4 last:border-0"
              >
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#2c7469]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-700">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-slate-400">
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "2-digit",
                    month: "short",
                  }).format(new Date(item.date))}
                </span>
              </div>
            ))
          ) : (
            <p className="p-5 text-sm text-slate-500">
              No recent request activity.
            </p>
          )}
        </article>
        <article className="rounded-2xl bg-[#17665c] p-5 text-white shadow-sm">
          <WalletCards className="mb-6 text-[#bfe0d9]" size={25} />
          <p className="text-sm text-[#d4ebe6]">Attendance status</p>
          <p className="mt-1 text-2xl font-bold">
            {active
              ? `Checked in · ${time(active.checkInAt)}`
              : "Not checked in"}
          </p>
          <p className="mt-5 text-sm leading-6 text-[#d4ebe6]">
            Keep your attendance and requests up to date before payroll closes.
          </p>
          <div className="mt-5 rounded-xl bg-white/10 p-3 text-sm">
            <p className="text-[#d4ebe6]">Pending leave requests</p>
            <p className="mt-1 text-xl font-bold">
              {leave.filter((r) => r.status === "PENDING").length}
            </p>
          </div>
        </article>
      </section>
    </OmPageShell>
  );
}
