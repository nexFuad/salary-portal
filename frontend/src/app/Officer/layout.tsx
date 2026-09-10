"use client";

import {
  CircleUserRound,
  EllipsisVertical,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  UsersRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/Hooks/useAuth";

type OfficerLayoutProps = { children: ReactNode };

const navigationItems = [
  {
    label: "Dashboard",
    href: "/Officer/dashboard",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    label: "Employees",
    href: "/Officer/employees",
    icon: UsersRound,
    enabled: true,
  },
  {
    label: "Payroll",
    href: "/Officer/payroll",
    icon: ReceiptText,
    enabled: true,
  },
  {
    label: "Requests & Reports",
    href: "/Officer/requests-reports",
    icon: ReceiptText,
    enabled: true,
  },
] as const;

function BrandLogo() {
  return (
    <Link
      href="/Officer/dashboard"
      className="flex items-center gap-2.5"
      aria-label="SalaryFlow dashboard"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-[#1d625b] text-[11px] font-bold text-white">
        SF
      </span>
      <span className="text-[17px] font-bold tracking-[-0.04em] text-[#1f2a34]">
        SalaryFlow
      </span>
    </Link>
  );
}

export default function OfficerLayout({ children }: OfficerLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.replace("/");
    router.refresh();
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  const displayName = user?.name?.trim() || user?.employeeId || "Officer";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f7f9f9] text-[#202b35]">
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close dashboard menu"
          className="fixed inset-0 z-40 bg-slate-900/25 lg:hidden"
          onClick={closeSidebar}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[260px] flex-col border-r border-[#e6ebeb] bg-white transition-transform lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#e6ebeb] px-4 lg:px-5">
          <BrandLogo />
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-lg p-2 text-[#64717c] hover:bg-[#eff5f4] lg:hidden"
            aria-label="Close dashboard menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Officer navigation" className="space-y-1 px-2.5 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.enabled && pathname === item.href;

            if (!item.enabled) {
              return (
                <span
                  key={item.label}
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#a0a9ae]"
                  title="This page will be available soon"
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#e8f0ef] text-[#23665f]"
                    : "text-[#58646e] hover:bg-[#f1f6f5] hover:text-[#23665f]"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 border-t border-[#edf0f0] p-4">
          <Link
            href="/Officer/my-accounts"
            onClick={closeSidebar}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-semibold text-[#52606a] transition hover:bg-[#eff5f4] hover:text-[#1d625b]"
          >
            <CircleUserRound size={17} />
            My accounts
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[13px] font-semibold text-[#c25d5d] transition hover:bg-[#fdf0f0] hover:text-[#a84646]"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-[#e6ebeb] bg-white lg:h-[72px]">
          <div className="flex w-full items-center justify-between px-4 sm:px-7">
            <div className="lg:hidden">
              <BrandLogo />
            </div>

            <div className="ml-auto hidden items-center lg:flex">
              <div className="flex items-center gap-2 text-left">
                {user?.profilePic ? (
                  <Image
                    src={user.profilePic}
                    alt={`${displayName}'s profile`}
                    width={40}
                    height={40}
                    unoptimized
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-10 place-items-center rounded-full bg-[#1d625b] text-xs font-bold text-white">
                    {initials}
                  </span>
                )}
                <span className="leading-tight">
                  <span className="block text-sm font-bold text-[#26313a]">
                    {displayName}
                  </span>
                  <span className="block text-xs text-[#7a8790]">
                    {user?.role ?? "Officer"}
                  </span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-[#52606b] transition hover:bg-[#eff5f4] lg:hidden"
              aria-label="Open dashboard menu"
            >
              <EllipsisVertical size={24} />
            </button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-72px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
