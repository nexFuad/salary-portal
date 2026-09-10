"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import Modal from "@/Components/Shared/Modal";
import Pagination from "@/Components/Shared/Pagination";
import { officerRequestsService } from "@/Services/officer-requests.services";
import type { OfficerAttendanceRecord } from "@/Types/officer-requests";
import {
  RequestTableSkeleton,
  SimpleTable,
  StatusBadge,
  TableCell,
  TableRow,
} from "../Shared";
const time = (v: string | null) =>
  v
    ? new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(v))
    : "—";
const date = (v: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(v));
function duration(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;
}

function scheduleMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours && remainingMinutes) return `${hours}h ${remainingMinutes}m`;
  if (hours) return `${hours}h`;
  return `${remainingMinutes}m`;
}

function minutesFromDate(value: string) {
  const timestamp = new Date(value);
  return timestamp.getHours() * 60 + timestamp.getMinutes();
}

function checkInNote(record: OfficerAttendanceRecord) {
  const difference =
    minutesFromDate(record.checkInAt) - scheduleMinutes(record.shiftStartTime);
  if (difference > 0)
    return { label: `${durationLabel(difference)} late`, className: "text-rose-600" };
  if (difference < 0)
    return {
      label: `${durationLabel(Math.abs(difference))} early check-in`,
      className: "text-emerald-700",
    };
  return { label: "On time", className: "text-emerald-700" };
}

function checkOutNote(record: OfficerAttendanceRecord) {
  if (!record.checkOutAt) return null;
  const difference =
    minutesFromDate(record.checkOutAt) - scheduleMinutes(record.shiftEndTime);
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

function hours(record: OfficerAttendanceRecord) {
  if (!record.checkOutAt)
    return { worked: "—", short: "—", over: "—", status: "Pending" };
  const min =
    (new Date(record.checkOutAt).getTime() -
      new Date(record.checkInAt).getTime()) /
    60000;
  const normal = Math.max(
    0,
    scheduleMinutes(record.shiftEndTime) -
      scheduleMinutes(record.shiftStartTime),
  );
  return {
    worked: duration(min),
    short: min < normal ? duration(normal - min) : "—",
    over: min > normal ? duration(min - normal) : "—",
    status: min < normal ? "Short hours" : "Present",
  };
}
export default function AttendanceRecords() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["officer-attendance"],
    queryFn: officerRequestsService.attendance,
  });
  const del = useMutation({
    mutationFn: officerRequestsService.deleteAttendance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["officer-attendance"] }),
  });
  const [page, setPage] = useState(1);
  const [photo, setPhoto] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const all = q.data ?? [];
  const size = 10;
  const safe = Math.min(page, Math.max(1, Math.ceil(all.length / size)));
  const rows = all.slice((safe - 1) * size, safe * size);
  return (
    <div>
      <SimpleTable
        className="min-h-[70vh]"
        tableClassName="min-w-[1400px]"
        headers={[
          "Employee",
          "Date",
          "Check in",
          "Check out",
          "Check-in photo",
          "Check-out photo",
          "Working hours",
          "Short hours",
          "Overtime",
          "Status",
          "Actions",
        ]}
      >
        {q.isPending ? <RequestTableSkeleton columns={11} /> : rows.map((r) => {
          const h = hours(r);
          const checkIn = checkInNote(r);
          const checkOut = checkOutNote(r);
          return (
            <TableRow key={r.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {r.user.profilePic ? (
                    <img
                      src={r.user.profilePic}
                      alt=""
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-8 place-items-center rounded-full bg-[#17665c] text-xs text-white">
                      {(r.user.name ?? r.user.employeeId)
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                  <b>{r.user.name ?? r.user.employeeId}</b>
                </div>
              </TableCell>
              <TableCell>{date(r.workDate)}</TableCell>
              <TableCell>
                <p className="font-medium text-slate-700">{time(r.checkInAt)}</p>
                <p className={`mt-0.5 text-[11px] font-medium ${checkIn.className}`}>
                  {checkIn.label}
                </p>
              </TableCell>
              <TableCell>
                <p className="font-medium text-slate-700">{time(r.checkOutAt)}</p>
                {checkOut ? (
                  <p className={`mt-0.5 text-[11px] font-medium ${checkOut.className}`}>
                    {checkOut.label}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  title="View check-in photo"
                  onClick={() =>
                    setPhoto({
                      url: r.checkInPhotoUrl,
                      title: "Check-in photo",
                    })
                  }
                  className="rounded-md outline-none focus:ring-2 focus:ring-[#17665c]"
                >
                  <img
                    src={r.checkInPhotoUrl}
                    alt="Check-in"
                    className="size-9 rounded-lg object-cover"
                  />
                </button>
              </TableCell>
              <TableCell>
                {r.checkOutPhotoUrl ? (
                  <button
                    type="button"
                    title="View check-out photo"
                    onClick={() =>
                      setPhoto({
                        url: r.checkOutPhotoUrl!,
                        title: "Check-out photo",
                      })
                    }
                    className="rounded-md outline-none focus:ring-2 focus:ring-[#17665c]"
                  >
                    <img
                      src={r.checkOutPhotoUrl}
                      alt="Check-out"
                      className="size-9 rounded-lg object-cover"
                    />
                  </button>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{h.worked}</TableCell>
              <TableCell>{h.short}</TableCell>
              <TableCell>{h.over}</TableCell>
              <TableCell>
                <StatusBadge status={h.status} />
              </TableCell>
              <TableCell>
                <button
                  onClick={() => del.mutate(r.id)}
                  className="text-rose-600"
                >
                  <Trash2 size={18} />
                </button>
              </TableCell>
            </TableRow>
          );
        })}
      </SimpleTable>
      <Pagination
        currentPage={safe}
        totalItems={all.length}
        pageSize={size}
        onPageChange={setPage}
        className="pb-8"
      />
      {photo ? (
        <Modal title={photo.title} onClose={() => setPhoto(null)}>
          <img
            src={photo.url}
            alt={photo.title}
            className="max-h-[65vh] w-full object-contain"
          />
        </Modal>
      ) : null}
    </div>
  );
}
