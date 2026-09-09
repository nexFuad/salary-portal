"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  FileText,
  HandCoins,
  Home,
  LogOut,
  Menu,
  ReceiptText,
  UserRoundCheck,
  WalletCards,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/Hooks/useAuth";

const links = [
  { href: "/OM/dashboard", label: "Home", icon: Home },
  { href: "/OM/leave-request", label: "Leave", icon: CalendarDays },
  { href: "/OM/attendance", label: "Attendance", icon: UserRoundCheck },
  { href: "/OM/salary-advance", label: "Salary advance", icon: HandCoins },
  { href: "/OM/loans", label: "Loans", icon: WalletCards },
  { href: "/OM/documents", label: "Documents", icon: FileText },
  { href: "/OM/my-accounts", label: "My account", icon: ReceiptText },
];

export default function OmLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  useEffect(() => {
    const update = () =>
      setVisibleCount(
        window.innerWidth >= 1180
          ? links.length
          : window.innerWidth >= 760
            ? 5
            : 3,
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const visible = links.slice(0, visibleCount);
  const hidden = links.slice(visibleCount);
  const go = (href: string) => {
    setMoreOpen(false);
    router.push(href);
  };
  const handleLogout = async () => {
    setMoreOpen(false);
    await logout();
    router.replace("/Login?loggedOut=1");
  };
  return (
    <div className="min-h-dvh bg-[#f7f9f9] pb-24 text-[#1f2933]">
      {children}
      {moreOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/20"
        />
      )}
      {moreOpen && hidden.length > 0 && (
        <section className="fixed bottom-20 right-3 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/15 sm:bottom-24 sm:right-5">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            More options
          </p>
          <div className="grid gap-1">
            {hidden.map(({ href, label, icon: Icon }) => (
              <button
                key={href}
                onClick={() => go(href)}
                className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium ${pathname === href ? "bg-[#e7f0ee] text-[#17665c]" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={17} />
              Log out
            </button>
          </div>
        </section>
      )}
      <nav className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl border border-slate-200 bg-white/95 px-2 py-2 shadow-lg shadow-slate-900/10 backdrop-blur sm:inset-x-5">
        {visible.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <button
              key={href}
              onClick={() => go(href)}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-16 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold ${active ? "bg-[#e7f0ee] text-[#17665c]" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Icon size={19} />
              {label}
            </button>
          );
        })}
        {hidden.length > 0 && (
          <button
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((value) => !value)}
            className={`flex min-w-16 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold ${moreOpen ? "bg-[#e7f0ee] text-[#17665c]" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Menu size={20} />
            More
          </button>
        )}
        {hidden.length === 0 && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-w-16 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut size={19} />
            Logout
          </button>
        )}
      </nav>
    </div>
  );
}
