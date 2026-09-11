"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CalendarDays, Camera, Clock3, LogIn, LogOut, Search, Trash2 } from "lucide-react";
import CameraCapture from "@/Components/Shared/CameraCapture";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import Modal from "@/Components/Shared/Modal";
import OmPageShell from "@/Components/OM/OmPageShell";
import { useInfiniteScroll } from "@/Hooks/useInfiniteScroll";
import { useSearchBar } from "@/Hooks/useSearchBar";
import { attendanceService } from "@/Services/attendance.services";
import { uploadAttendancePhoto } from "@/Services/upload.services";
import type { AttendanceRecord } from "@/Types/attendance";

type AttendanceAction = "check-in" | "check-out" | null;
type AttendanceForm = {
  shiftStartTime: string;
  shiftEndTime: string;
  attendanceTime: string;
};
const currentTimeValue = () =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(/\./g, ":");
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
  const [action, setAction] = useState<AttendanceAction>(null);
  const [photo, setPhoto] = useState<{ file: Blob; previewUrl: string } | null>(
    null,
  );
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState("");
  const [attendanceForm, setAttendanceForm] = useState<AttendanceForm>({
    shiftStartTime: "09:00",
    shiftEndTime: "15:00",
    attendanceTime: currentTimeValue(),
  });
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
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
  const listQuery = useQuery({
    queryKey: ["attendance", searchQuery],
    queryFn: () => attendanceService.list({ search: searchQuery || undefined }),
    enabled: activeTab === "history",
  });
  const currentAttendance = currentQuery.data ?? null;
  const records = listQuery.data ?? [];
  const { visibleItems: visibleRecords, hasMore, sentinelRef } =
    useInfiniteScroll(records);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!action || !photo) throw new Error("Please take a photo first.");
      const photoUrl = await uploadAttendancePhoto(photo.file);
      const payload = { photoUrl, ...attendanceForm };
      if (action === "check-in") return attendanceService.checkIn(payload);
      if (!currentAttendance)
        throw new Error("You need to check in before checking out.");
      return attendanceService.checkOut(currentAttendance.id, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["attendance"] }),
        queryClient.invalidateQueries({ queryKey: ["attendance", "current"] }),
      ]);
      closeModal();
    },
    onError: (mutationError) =>
      setError(
        axios.isAxiosError(mutationError)
          ? (mutationError.response?.data?.message ??
              "Attendance could not be saved.")
          : mutationError instanceof Error
            ? mutationError.message
            : "Attendance could not be saved.",
      ),
  });
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

  function openModal(nextAction: Exclude<AttendanceAction, null>) {
    setAction(nextAction);
    setPhoto(null);
    setIsCameraOpen(false);
    setError("");
    setAttendanceForm({
      shiftStartTime:
        nextAction === "check-out" && currentAttendance
          ? currentAttendance.shiftStartTime
          : "09:00",
      shiftEndTime:
        nextAction === "check-out" && currentAttendance
          ? currentAttendance.shiftEndTime
          : "15:00",
      attendanceTime: currentTimeValue(),
    });
  }
  function closeModal() {
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    setAction(null);
    setPhoto(null);
    setIsCameraOpen(false);
    setError("");
  }

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
          {currentQuery.isPending || currentQuery.isError ? (
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
          <button type="button" onClick={() => openModal(currentAttendance ? "check-out" : "check-in")} disabled={currentQuery.isPending} className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60 ${currentAttendance ? "border border-slate-200 text-slate-700" : "bg-[#17665c] text-white"}`}>
            {currentAttendance ? <LogOut className="size-4" /> : <LogIn className="size-4" />}
            {currentAttendance ? `Check out · checked in at ${formatTime(currentAttendance.checkInAt)}` : "Check in"}
          </button>
        </article>
      ) : <>
        <label className="mb-4 flex h-10 max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-white px-3"><Search className="size-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search attendance history" className="min-w-0 flex-1 text-sm outline-none" /></label>
      {listQuery.isPending || listQuery.isError ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>
      ) : records.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">No attendance record found.</section>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {visibleRecords.map((record) => {
              const checkIn = checkInNote(record);
              const checkOut = checkOutNote(record);
              return <article key={record.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-[#17665c]"><CalendarDays className="size-4" /><p className="font-semibold text-slate-800">{formatDate(record.workDate)}</p></div><p className="mt-1 text-xs text-slate-500">Shift {record.shiftStartTime} – {record.shiftEndTime}</p></div><div className="flex items-center gap-1"><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${record.checkOutAt ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{record.checkOutAt ? "Completed" : "Working"}</span><button type="button" onClick={() => setRecordToDelete(record)} aria-label="Delete attendance record" title="Delete" className="grid size-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"><Trash2 className="size-4" /></button></div></div><div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3"><div><p className="text-xs text-slate-400">Check in</p><p className="mt-1 font-semibold text-slate-800">{formatTime(record.checkInAt)}</p><p className={`text-xs font-medium ${checkIn.className}`}>{checkIn.label}</p></div><div><p className="text-xs text-slate-400">Check out</p><p className="mt-1 font-semibold text-slate-800">{formatTime(record.checkOutAt)}</p>{checkOut ? <p className={`text-xs font-medium ${checkOut.className}`}>{checkOut.label}</p> : null}</div></div><div className="mt-2 flex items-center justify-between"><p className="text-xs text-slate-400">Working hours</p><p className="text-sm font-semibold text-slate-700">{workHours(record)}</p></div></article>;
            })}
          </div>
          {hasMore ? <div ref={sentinelRef} className="py-8 text-center text-sm font-medium text-slate-400">Loading more attendance records…</div> : null}
        </>
      )}</>}
      {action && (
        <Modal
          title={action === "check-in" ? "Check in" : "Check out"}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Shift starts at
                <input
                  required
                  type="time"
                  value={attendanceForm.shiftStartTime}
                  onChange={(event) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      shiftStartTime: event.target.value,
                    })
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#17665c]"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Shift ends at
                <input
                  required
                  type="time"
                  min={attendanceForm.shiftStartTime}
                  value={attendanceForm.shiftEndTime}
                  onChange={(event) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      shiftEndTime: event.target.value,
                    })
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#17665c]"
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              {action === "check-in" ? "Check-in time" : "Check-out time"}
              <input
                required
                type="time"
                value={attendanceForm.attendanceTime}
                onChange={(event) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    attendanceTime: event.target.value,
                  })
                }
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#17665c]"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Current time is selected by default; you may adjust it.
              </span>
            </label>

            {photo ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <Image
                  src={photo.previewUrl}
                  alt="Captured attendance preview"
                  width={144}
                  height={96}
                  unoptimized
                  className="h-24 w-36 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-emerald-800">
                    Photo captured
                  </p>
                  <p className="mt-1 text-xs text-emerald-700">
                    Your photo is ready to submit.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(photo.previewUrl);
                      setPhoto(null);
                      setIsCameraOpen(false);
                    }}
                    className="mt-2 text-xs font-semibold text-[#17665c] hover:underline"
                  >
                    Retake photo
                  </button>
                </div>
              </div>
            ) : isCameraOpen ? (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <CameraCapture
                  compact
                  className="w-44 shrink-0"
                  onCapture={(file, previewUrl) =>
                    setPhoto({ file, previewUrl })
                  }
                />
                <p className="pt-1 text-xs leading-5 text-amber-800">
                  Position your face inside the camera frame, then tap Take
                  photo.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm text-amber-900">
                  Take a live photo to verify your attendance.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#17665c] px-3 py-2 text-sm font-semibold text-white"
                >
                  <Camera className="size-4" /> Take photo
                </button>
              </div>
            )}
            {error && <p className="text-sm text-rose-600">{error}</p>}
            {photo ? (
              <button
                type="button"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#17665c] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Camera className="size-4" />{" "}
                {saveMutation.isPending
                  ? "Uploading…"
                  : action === "check-in"
                    ? "Check in"
                    : "Check out"}
              </button>
            ) : null}
          </div>
        </Modal>
      )}
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
