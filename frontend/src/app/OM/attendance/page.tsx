"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, LogIn, LogOut, Search, Trash2 } from "lucide-react";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import LoadMoreStatus from "@/Components/Shared/LoadMoreStatus";
import DataLoadError from "@/Components/Shared/DataLoadError";
import OmPageShell from "@/Components/OM/OmPageShell";
import AttendanceDialog from "@/Components/OM/attendance-dialog";
import { useLoadMoreOnScroll } from "@/Hooks/useLoadMoreOnScroll";
import { useSearchBar } from "@/Hooks/useSearchBar";
import { attendanceService } from "@/Services/attendance.services";
import type { AttendanceAction, AttendanceRecord, AttendanceTab } from "@/Types/attendance";
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
const formatTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(value))
    : "—";

function workHours(record: AttendanceRecord) {
  if (!record.checkOutAt) return "—";
  const minutes = Math.max(
    0,
    Math.round(
      (new Date(record.checkOutAt).getTime() -
        new Date(record.checkInAt).getTime()) /
        60000,
    ),
  );
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours && remainingMinutes) return `${hours}h ${remainingMinutes}m`;
  if (hours) return `${hours}h`;
  return `${remainingMinutes}m`;
}

function minutesFromShift(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesFromDate(value: string) {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes();
}

function checkInNote(record: AttendanceRecord) {
  const difference =
    minutesFromDate(record.checkInAt) - minutesFromShift(record.shiftStartTime);
  if (difference > 0)
    return {
      label: `${durationLabel(difference)} late`,
      className: "text-rose-600",
    };
  if (difference < 0)
    return {
      label: `${durationLabel(Math.abs(difference))} early check-in`,
      className: "text-emerald-700",
    };
  return { label: "On time", className: "text-emerald-700" };
}

function checkOutNote(record: AttendanceRecord) {
  if (!record.checkOutAt) return null;
  const difference =
    minutesFromDate(record.checkOutAt) - minutesFromShift(record.shiftEndTime);
  if (difference > 0)
    return {
      label: `${durationLabel(difference)} overtime`,
      className: "text-emerald-700",
    };
  if (difference < 0)
    return {
      label: `Left ${durationLabel(Math.abs(difference))} early`,
      className: "text-rose-600",
    };
  return { label: "On time", className: "text-emerald-700" };
}

export default function OmAttendancePage() {
  const queryClient = useQueryClient();
  const { query: search, setQuery: setSearch, searchQuery } = useSearchBar();
  const pageSize = 10;
  const [action, setAction] = useState<AttendanceAction | null>(null);
  const [activeTab, setActiveTab] = useState<AttendanceTab>("current");
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(
    null,
  );
  const [clock, setClock] = useState<Date | null>(null);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentQuery = useQuery({
    queryKey: ["attendance", "current"],
    queryFn: attendanceService.current,
  });
  const listQuery = useInfiniteQuery({
    queryKey: ["attendance", searchQuery],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => attendanceService.list({ search: searchQuery || undefined, page: pageParam, pageSize }),
    getNextPageParam: (lastPage, pages) => pages.length * pageSize < lastPage.total ? pages.length + 1 : undefined,
    enabled: activeTab === "history",
  });
  const currentAttendance = currentQuery.data ?? null;
  const records = listQuery.data?.pages.flatMap((result) => result.items) ?? [];
  const sentinelRef = useLoadMoreOnScroll(activeTab === "history" && Boolean(listQuery.hasNextPage) && !listQuery.isFetchingNextPage && !listQuery.isFetchNextPageError, () => { void listQuery.fetchNextPage(); });

  const deleteMutation = useMutation({
    mutationFn: attendanceService.remove,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["attendance"] }),
        queryClient.invalidateQueries({ queryKey: ["attendance", "current"] }),
      ]);
      setRecordToDelete(null);
    },
  });

  const today = clock
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(clock)
    : "—";
  const now = clock
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(clock)
    : "—";

  return (
    <OmPageShell
      title="Attendance"
      subtitle="Check in and out with a live camera photo."
    >
      <div className="mb-5 flex border-b border-slate-200">
        {(["current", "history"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-3 text-sm font-semibold capitalize transition ${activeTab === tab ? "border-[#17665c] text-[#17665c]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "current" ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[#17665c]">
                <Clock3 className="size-5" />
                <p className="text-sm font-semibold">Today&apos;s attendance</p>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-700">{today}</p>
              <p className="mt-1 text-xs text-slate-500">Current time: {now}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${currentAttendance?.checkOutAt ? "bg-emerald-50 text-emerald-700" : currentAttendance ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
              {currentAttendance?.checkOutAt ? "Completed" : currentAttendance ? "Working" : "Not checked in"}
            </span>
          </div>
          {currentQuery.isError ? (
            <div className="mt-5"><DataLoadError retry={() => void currentQuery.refetch()} /></div>
          ) : currentQuery.isPending ? (
            <div className="mt-5 h-28 animate-pulse rounded-xl bg-slate-100" />
          ) : currentAttendance ? (
            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Image src={currentAttendance.checkInPhotoUrl} alt="Check-in" width={48} height={48} unoptimized className="size-12 rounded-xl object-cover" />
                <div><p className="text-xs text-slate-400">Check in</p><p className="font-semibold text-slate-800">{formatTime(currentAttendance.checkInAt)}</p><p className={`text-xs font-medium ${checkInNote(currentAttendance).className}`}>{checkInNote(currentAttendance).label}</p></div>
              </div>
              <div className="flex items-center gap-3">
                {currentAttendance.checkOutPhotoUrl ? <Image src={currentAttendance.checkOutPhotoUrl} alt="Check-out" width={48} height={48} unoptimized className="size-12 rounded-xl object-cover" /> : <span className="grid size-12 place-items-center rounded-xl bg-slate-100"><LogOut className="size-5 text-slate-400" /></span>}
                <div><p className="text-xs text-slate-400">Check out</p><p className="font-semibold text-slate-800">{formatTime(currentAttendance.checkOutAt)}</p>{checkOutNote(currentAttendance) ? <p className={`text-xs font-medium ${checkOutNote(currentAttendance)?.className}`}>{checkOutNote(currentAttendance)?.label}</p> : <p className="text-xs text-slate-400">Not checked out yet</p>}</div>
              </div>
            </div>
          ) : (
            <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">You have not checked in today.</p>
          )}
          <button type="button" onClick={() => setAction(currentAttendance ? "check-out" : "check-in")} disabled={currentQuery.isPending || currentQuery.isError} className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60 ${currentAttendance ? "border border-slate-200 text-slate-700" : "bg-[#17665c] text-white"}`}>
            {currentAttendance ? <LogOut className="size-4" /> : <LogIn className="size-4" />}
            {currentAttendance ? `Check out · checked in at ${formatTime(currentAttendance.checkInAt)}` : "Check in"}
          </button>
        </article>
      ) : <>
        <label className="mb-4 flex h-10 max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-white px-3"><Search className="size-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search attendance history" className="min-w-0 flex-1 text-sm outline-none" /></label>
      {listQuery.isError && !listQuery.data ? (
        <DataLoadError retry={() => void listQuery.refetch()} />
      ) : listQuery.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>
      ) : records.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">No attendance record found.</section>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {records.map((record) => {
              const checkIn = checkInNote(record);
              const checkOut = checkOutNote(record);
              return <article key={record.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-[#17665c]"><CalendarDays className="size-4" /><p className="font-semibold text-slate-800">{formatDate(record.workDate)}</p></div><p className="mt-1 text-xs text-slate-500">Shift {record.shiftStartTime} – {record.shiftEndTime}</p></div><div className="flex items-center gap-1"><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${record.checkOutAt ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{record.checkOutAt ? "Completed" : "Working"}</span><button type="button" onClick={() => setRecordToDelete(record)} aria-label="Delete attendance record" title="Delete" className="grid size-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"><Trash2 className="size-4" /></button></div></div><div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3"><div><p className="text-xs text-slate-400">Check in</p><p className="mt-1 font-semibold text-slate-800">{formatTime(record.checkInAt)}</p><p className={`text-xs font-medium ${checkIn.className}`}>{checkIn.label}</p></div><div><p className="text-xs text-slate-400">Check out</p><p className="mt-1 font-semibold text-slate-800">{formatTime(record.checkOutAt)}</p>{checkOut ? <p className={`text-xs font-medium ${checkOut.className}`}>{checkOut.label}</p> : null}</div></div><div className="mt-2 flex items-center justify-between"><p className="text-xs text-slate-400">Working hours</p><p className="text-sm font-semibold text-slate-700">{workHours(record)}</p></div></article>;
            })}
          </div>
          <div ref={sentinelRef} className="min-h-6">
            <LoadMoreStatus loading={listQuery.isFetchingNextPage} error={listQuery.isFetchNextPageError} onRetry={() => void listQuery.fetchNextPage()} />
          </div>
        </>
      )}</>}
      {action && <AttendanceDialog key={action} action={action} currentAttendance={currentAttendance} onClose={() => setAction(null)} />}
      {recordToDelete && (
        <ConfirmDialog
          title="Delete attendance record?"
          message={`Are you sure you want to permanently delete the attendance record for ${formatDate(recordToDelete.workDate)}?`}
          isPending={deleteMutation.isPending}
          onCancel={() => setRecordToDelete(null)}
          onConfirm={() => deleteMutation.mutate(recordToDelete.id)}
        />
      )}
    </OmPageShell>
  );
}
