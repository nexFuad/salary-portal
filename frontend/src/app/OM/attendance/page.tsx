"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Camera, Clock3, LogIn, LogOut, Trash2 } from "lucide-react";
import CameraCapture from "@/Components/Shared/CameraCapture";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import Modal from "@/Components/Shared/Modal";
import OmTable from "@/Components/Shared/OmTable";
import TableSkeleton from "@/Components/Shared/TableSkeleton";
import { type TableColumn } from "@/Components/Shared/Table";
import OmPageShell from "@/Components/OM/OmPageShell";
import { attendanceService } from "@/Services/attendance.services";
import { uploadAttendancePhoto } from "@/Services/upload.services";
import type { AttendanceRecord } from "@/Types/attendance";

type AttendanceAction = "check-in" | "check-out" | null;
type AttendanceForm = {
  shiftStartTime: string;
  shiftEndTime: string;
  attendanceTime: string;
};
const pageSize = 10;
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
  const [currentPage, setCurrentPage] = useState(1);
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
    queryKey: ["attendance"],
    queryFn: attendanceService.list,
  });
  const currentAttendance = currentQuery.data ?? null;
  const records = listQuery.data ?? [];
  const visibleRecords = records.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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

  const columns: TableColumn<AttendanceRecord>[] = [
    {
      id: "employee",
      header: "Employee",
      cell: (record) => (
        <div>
          <p className="font-medium text-slate-700">
            {record.user.name ?? record.user.employeeId}
          </p>
          <p className="text-xs text-slate-400">{record.user.role}</p>
        </div>
      ),
    },
    {
      id: "date",
      header: "Date",
      cell: (record) => (
        <span className="font-medium text-slate-700">
          {formatDate(record.workDate)}
        </span>
      ),
    },
    {
      id: "shift",
      header: "Shift",
      cell: (record) => `${record.shiftStartTime} – ${record.shiftEndTime}`,
    },
    {
      id: "checkIn",
      header: "Check in",
      cell: (record) => {
        const note = checkInNote(record);
        return (
          <div>
            <p className="font-medium text-slate-700">
              {formatTime(record.checkInAt)}
            </p>
            <p className={`mt-0.5 text-[11px] font-medium ${note.className}`}>
              {note.label}
            </p>
          </div>
        );
      },
    },
    {
      id: "checkOut",
      header: "Check out",
      cell: (record) => {
        const note = checkOutNote(record);
        return (
          <div>
            <p className="font-medium text-slate-700">
              {formatTime(record.checkOutAt)}
            </p>
            {note ? (
              <p className={`mt-0.5 text-[11px] font-medium ${note.className}`}>
                {note.label}
              </p>
            ) : null}
          </div>
        );
      },
    },
    { id: "hours", header: "Working hours", cell: workHours },
    {
      id: "status",
      header: "Status",
      cell: (record) => (
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${record.checkOutAt ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
        >
          {record.checkOutAt ? "Completed" : "Working"}
        </span>
      ),
    },
    {
      id: "checkInPhoto",
      header: "Check-in photo",
      cell: (record) => (
        <Image
          src={record.checkInPhotoUrl}
          alt="Check-in"
          width={40}
          height={40}
          unoptimized
          className="size-9 rounded-lg border border-slate-200 object-cover"
        />
      ),
    },
    {
      id: "checkOutPhoto",
      header: "Check-out photo",
      cell: (record) =>
        record.checkOutPhotoUrl ? (
          <Image
            src={record.checkOutPhotoUrl}
            alt="Check-out"
            width={40}
            height={40}
            unoptimized
            className="size-9 rounded-lg border border-slate-200 object-cover"
          />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (record) => (
        <button
          type="button"
          onClick={() => setRecordToDelete(record)}
          className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50"
          aria-label="Delete attendance record"
          title="Delete record"
        >
          <Trash2 className="size-4" />
        </button>
      ),
    },
  ];
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
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Clock3 className="mb-4 text-[#17665c]" />
          <p className="text-sm text-slate-500">Today</p>
          <p className="mt-1 font-semibold text-slate-800">{today}</p>
          <p className="mt-1 text-sm text-slate-500">Current time: {now}</p>
          <p className="mt-4 text-xl font-bold text-slate-800">
            {currentAttendance?.checkOutAt
              ? "Completed"
              : currentAttendance
                ? "Working"
                : "Not checked in"}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">
            Attendance action
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Set your shift and confirm attendance with a live camera photo.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() =>
                openModal(currentAttendance ? "check-out" : "check-in")
              }
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${currentAttendance ? "border border-slate-200 text-slate-700" : "bg-[#17665c] text-white"}`}
            >
              <span>
                {currentAttendance ? (
                  <LogOut className="size-4" />
                ) : (
                  <LogIn className="size-4" />
                )}
              </span>
              {currentAttendance
                ? `Check out · checked in at ${formatTime(currentAttendance.checkInAt)}`
                : "Check in"}
            </button>
          </div>
        </article>
      </section>
      {listQuery.isPending ? (
        <div className="mt-5">
          <TableSkeleton rows={8} />
        </div>
      ) : listQuery.isError ? (
        <section className="mt-5 min-h-[70vh] rounded-2xl border border-slate-200 bg-white p-6 text-sm text-rose-600">
          Could not load attendance records.
        </section>
      ) : (
        <div className="mt-5">
          <OmTable
            title="Attendance history"
            columns={columns}
            data={visibleRecords}
            getRowId={(record) => record.id}
            emptyMessage="No attendance record found."
            currentPage={currentPage}
            totalItems={records.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
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
