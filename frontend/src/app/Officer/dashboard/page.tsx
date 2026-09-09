"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckSquare2,
  Clock3,
  Landmark,
  PlayCircle,
  UserRoundPlus,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type { ComponentType } from "react";
import TableSkeleton from "@/Components/Shared/TableSkeleton";
import { officerRequestsService } from "@/Services/officer-requests.services";
import type { OfficerDashboard } from "@/Types/officer-dashboard";

type IconProps = { size?: number; strokeWidth?: number; className?: string };
type StatCard = {
  label: string;
  value: string;
  note?: string;
  noteTone?: "success" | "warning";
  icon: ComponentType<IconProps>;
};

const money = (value: number) => `৳${Math.round(value).toLocaleString()}`;
const monthLabel = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short" }).format(
    new Date(`${value}-01T00:00:00Z`),
  );
const relativeTime = (value: string) => {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60_000),
  );
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
};

function DashboardLoading() {
  return (
    <section className="px-3 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-7">
      <div className="mb-5 h-14 w-64 animate-pulse rounded-xl bg-slate-200" />
      <TableSkeleton rows={8} />
    </section>
  );
}

export default function OfficerDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["officer-dashboard"],
    queryFn: officerRequestsService.dashboard,
  });

  if (dashboardQuery.isPending) return <DashboardLoading />;
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <section className="px-3 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-7">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Dashboard data could not be loaded. Please refresh and try again.
        </div>
      </section>
    );
  }

  return <DashboardContent dashboard={dashboardQuery.data} />;
}

function DashboardContent({ dashboard }: { dashboard: OfficerDashboard }) {
  const { overview, monthlySalaryExpenses, payrollStatus, activities } =
    dashboard;
  const currentMonth = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date());
  const highestExpense = Math.max(
    ...monthlySalaryExpenses.map((item) => item.total),
    1,
  );
  const statCards: StatCard[] = [
    {
      label: "Total employees",
      value: String(overview.totalEmployees),
      note: `${overview.activeEmployees} active · ${overview.inactiveEmployees} inactive`,
      noteTone: "success",
      icon: UsersRound,
    },
    {
      label: "This month's payroll",
      value: money(overview.monthlySalary),
      icon: WalletCards,
    },
    {
      label: "Pending payroll",
      value: String(overview.pendingPayroll),
      note: "awaiting action",
      noteTone: "warning",
      icon: Clock3,
    },
    {
      label: "Paid payroll",
      value: String(overview.paidPayroll),
      note: "this month",
      noteTone: "success",
      icon: CheckSquare2,
    },
    {
      label: "Pending leave",
      value: String(overview.pendingLeave),
      icon: CalendarClock,
    },
    {
      label: "Pending advances",
      value: String(overview.pendingAdvances),
      icon: UserRoundPlus,
    },
    {
      label: "Pending loans",
      value: String(overview.pendingLoans),
      icon: Landmark,
    },
  ];

  return (
    <section className="px-3 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-7">
      <div className="mb-5">
        <h1 className="text-[26px] font-bold tracking-[-0.035em] text-[#202b35]">
          Dashboard
        </h1>
        <p className="mt-0.5 text-[15px] text-[#77838d]">
          Overview for {currentMonth}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="min-h-27.5 rounded-xl border border-[#e1e8e7] bg-white p-3 shadow-[0_2px_5px_rgba(33,47,55,0.035)] sm:p-4 lg:min-h-30.5 lg:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium leading-5 text-[#7b8790] sm:text-sm">
                  {card.label}
                </p>
                <Icon
                  size={18}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#7c8891] sm:size-5"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <strong className="text-[22px] leading-none tracking-[-0.04em] text-[#202b35] sm:text-[26px] lg:text-[29px]">
                  {card.value}
                </strong>
                {card.note ? (
                  <span
                    className={`text-[11px] font-semibold sm:text-xs ${card.noteTone === "warning" ? "text-[#c18b28]" : "text-[#43816d]"}`}
                  >
                    {card.note}
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-5">
        <article className="overflow-hidden rounded-xl border border-[#e1e8e7] bg-white shadow-[0_2px_5px_rgba(33,47,55,0.035)] lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[#e9eeee] px-4 py-4 sm:px-5">
            <h2 className="text-[16px] font-bold text-[#29343d]">
              Monthly salary expense
            </h2>
            <span className="text-xs text-[#8a959d] sm:text-sm">
              Last 6 months
            </span>
          </div>
          <div className="flex h-57.5 items-end gap-3 border-b border-[#e5eaea] px-5 pt-6 sm:h-67.5 sm:gap-6 sm:px-7 lg:h-75 lg:gap-10">
            {monthlySalaryExpenses.map((item, index) => {
              const current = index === monthlySalaryExpenses.length - 1;
              const height = item.total
                ? Math.max((item.total / highestExpense) * 100, 8)
                : 8;
              return (
                <div
                  key={item.month}
                  className="flex h-full flex-1 flex-col justify-end"
                >
                  <div
                    className={`min-h-8 rounded-t-md ${current ? "bg-[#1d625b]" : "bg-[#cbd9d8]"}`}
                    style={{ height: `${height}%` }}
                    title={`${monthLabel(item.month)}: ${money(item.total)}`}
                  />
                  <span className="py-2 text-center text-xs text-[#7c8790] sm:py-3 sm:text-sm">
                    {monthLabel(item.month)}
                  </span>
                </div>
              );
            })}
          </div>
        </article>
        <article className="rounded-xl border border-[#e1e8e7] bg-white shadow-[0_2px_5px_rgba(33,47,55,0.035)]">
          <div className="border-b border-[#e9eeee] px-5 py-4">
            <h2 className="text-[16px] font-bold text-[#29343d]">
              Payroll status
            </h2>
          </div>
          <dl className="space-y-4 px-5 py-5 text-[15px]">
            {[
              ["Paid", payrollStatus.paid],
              ["Pending approval", payrollStatus.pending],
              ["Approved", payrollStatus.approved],
              ["Draft", payrollStatus.draft],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between gap-3">
                <dt className="text-[#58646d]">{label}</dt>
                <dd className="font-bold text-[#303b44]">{value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </div>

      <article className="mt-4 overflow-hidden rounded-xl border border-[#e1e8e7] bg-white shadow-[0_2px_5px_rgba(33,47,55,0.035)]">
        <div className="border-b border-[#e9eeee] px-5 py-4">
          <h2 className="text-[16px] font-bold text-[#29343d]">
            Recent activity
          </h2>
        </div>
        {activities.length ? (
          <div>
            {activities.map((activity) => (
              <div
                key={`${activity.title}-${activity.occurredAt}`}
                className="flex flex-col gap-1.5 border-b border-[#edf0f0] px-5 py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="text-[15px] font-semibold text-[#3b4650]">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-sm text-[#7c8891]">
                    {activity.detail}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-[#8b969e] sm:text-sm">
                  {relativeTime(activity.occurredAt)}
                </time>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-10 text-sm text-[#7c8891]">
            No recent activity found.
          </p>
        )}
      </article>

      <article className="mt-4 rounded-xl border border-[#e1e8e7] bg-white shadow-[0_2px_5px_rgba(33,47,55,0.035)]">
        <div className="border-b border-[#e9eeee] px-5 py-4">
          <h2 className="text-[16px] font-bold text-[#29343d]">
            Quick actions
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 px-5 py-4">
          {[
            {
              label: "Add employee",
              icon: UserRoundPlus,
              href: "/Officer/employees/new",
            },
            {
              label: "Generate payroll",
              icon: PlayCircle,
              href: "/Officer/payroll",
            },
            {
              label: "Review leave",
              icon: CalendarClock,
              href: "/Officer/requests-reports",
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-1.5 rounded-md border border-[#dfe6e5] bg-white px-3 py-2 text-xs font-semibold text-[#4c5962] transition hover:border-[#1d625b] hover:text-[#1d625b]"
              >
                <Icon size={15} strokeWidth={1.8} />
                {action.label}
              </Link>
            );
          })}
        </div>
      </article>
    </section>
  );
}
