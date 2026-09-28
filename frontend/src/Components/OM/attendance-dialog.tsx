"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import CameraCapture from "@/Components/Shared/CameraCapture";
import Modal from "@/Components/Shared/Modal";
import { attendanceService } from "@/Services/attendance.services";
import { uploadAttendancePhoto } from "@/Services/upload.services";
import type { AttendanceDialogProps, AttendanceForm, AttendancePhoto } from "@/Types/attendance";

const currentTimeValue = () =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(/\./g, ":");

export default function AttendanceDialog({ action, currentAttendance, onClose }: AttendanceDialogProps) {
  const queryClient = useQueryClient();
  const [photo, setPhoto] = useState<AttendancePhoto | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState("");
  const [attendanceForm, setAttendanceForm] = useState<AttendanceForm>({
    shiftStartTime: action === "check-out" && currentAttendance ? currentAttendance.shiftStartTime : "09:00",
    shiftEndTime: action === "check-out" && currentAttendance ? currentAttendance.shiftEndTime : "15:00",
    attendanceTime: currentTimeValue(),
  });

  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo.previewUrl);
    };
  }, [photo]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!photo) throw new Error("Please take a photo first.");
      const photoUrl = await uploadAttendancePhoto(photo.file);
      const payload = { photoUrl, ...attendanceForm };
      if (action === "check-in") return attendanceService.checkIn(payload);
      if (!currentAttendance) throw new Error("You need to check in before checking out.");
      return attendanceService.checkOut(currentAttendance.id, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["attendance"] }),
        queryClient.invalidateQueries({ queryKey: ["attendance", "current"] }),
      ]);
      onClose();
    },
    onError: (mutationError) =>
      setError(
        axios.isAxiosError(mutationError)
          ? (mutationError.response?.data?.message ?? "Attendance could not be saved.")
          : mutationError instanceof Error
            ? mutationError.message
            : "Attendance could not be saved.",
      ),
  });

  return (
    <Modal
      title={action === "check-in" ? "Check in" : "Check out"}
      onClose={() => !saveMutation.isPending && onClose()}
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
  );
}
