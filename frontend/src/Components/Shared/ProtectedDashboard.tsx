"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Hooks/useAuth";
import { dashboardPathByRole, type UserRole } from "@/Types/auth";
import DashboardLoading from "@/Components/Shared/DashboardLoading";

export default function ProtectedDashboard({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { user, isLoading, isAuthError, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || isAuthError) return;
    if (!user) router.replace("/Login");
    else if (user.role !== role) router.replace(dashboardPathByRole[user.role]);
  }, [isAuthError, isLoading, role, router, user]);

  if (isAuthError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f8f7] px-6 text-center">
        <p className="text-slate-700">Could not check your session. Please try again.</p>
        <button type="button" onClick={() => void refreshUser()} className="rounded-lg bg-[#2f766d] px-5 py-3 font-semibold text-white">
          Try again
        </button>
      </main>
    );
  }

  if (isLoading) return <DashboardLoading />;
  if (!user || user.role !== role) return null;
  return <>{children}</>;
}
