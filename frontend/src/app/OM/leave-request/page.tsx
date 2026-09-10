"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, Pencil, Trash2 } from "lucide-react";
import LeaveRequestForm from "@/Components/OM/LeaveRequestForm";
import OmPageShell from "@/Components/OM/OmPageShell";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import Modal from "@/Components/Shared/Modal";
import { useInfiniteScroll } from "@/Hooks/useInfiniteScroll";
import { leaveRequestService } from "@/Services/leave-request.services";
import type { LeaveRequest } from "@/Types/leave-request";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
const statusClass = (status: LeaveRequest["status"]) =>
  ({
    PENDING: "bg-amber-50 text-amber-700",
    APPROVED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-rose-50 text-rose-700",
    CANCELLED: "bg-slate-100 text-slate-600",
  })[status];

export default function LeaveRequestPage() {
  const queryClient = useQueryClient();
  const [openRequestId, setOpenRequestId] = useState<string | null | undefined>(
    undefined,
  );
  const [requestToDelete, setRequestToDelete] = useState<LeaveRequest | null>(
    null,
  );
  const {
    data: requests = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["leave-requests"],
    queryFn: leaveRequestService.list,
  });
  const deleteMutation = useMutation({
    mutationFn: leaveRequestService.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      setRequestToDelete(null);
    },
  });
  const { visibleItems: visibleRequests, hasMore, sentinelRef } =
    useInfiniteScroll(requests);
  return (
    <OmPageShell
      title="Leave requests"
      subtitle="Review and manage the leave requests you have submitted."
      action={
        <button
          type="button"
          onClick={() => setOpenRequestId(null)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#17665c] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#105348]"
        >
          <CalendarPlus className="size-4" />{" "}
          <span className="hidden sm:inline">Leave request</span>
          <span className="sm:hidden">Request</span>
        </button>
      }
    >
      {isPending || isError ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
          No leave request found.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleRequests.map((request) => {
              const isPending = request.status === "PENDING";
              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Leave type
                      </p>
                      <h2 className="mt-1 truncate text-base font-bold text-slate-800">
                        {request.leaveType}
                      </h2>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(request.status)}`}
                    >
                      {request.status[0] + request.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex gap-2.5 text-slate-600">
                      <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#2f766d]" />
                      <div>
                        <p className="text-xs font-medium text-slate-400">Date range</p>
                        <p className="mt-0.5 font-medium text-slate-700">
                          {formatDate(request.startDate)} – {formatDate(request.endDate)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">Reason</p>
                      <p className="mt-0.5 line-clamp-2 text-slate-700">{request.reason}</p>
                    </div>
                    {request.note ? (
                      <div>
                        <p className="text-xs font-medium text-slate-400">Note</p>
                        <p className="mt-0.5 line-clamp-2 text-slate-600">{request.note}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-400">
                      Submitted {formatDate(request.createdAt)}
                    </p>
                    {isPending ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setOpenRequestId(request.id)}
                          aria-label="Edit leave request"
                          title="Edit"
                          className="grid size-8 place-items-center rounded-lg text-[#17665c] transition hover:bg-[#edf6f4]"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRequestToDelete(request)}
                          aria-label="Delete leave request"
                          title="Delete"
                          className="grid size-8 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
          {hasMore ? (
            <div
              ref={sentinelRef}
              className="py-8 text-center text-sm font-medium text-slate-400"
            >
              Loading more leave requests…
            </div>
          ) : null}
        </>
      )}
      {openRequestId !== undefined && (
        <Modal
          title={openRequestId ? "Edit leave request" : "Leave request"}
          onClose={() => setOpenRequestId(undefined)}
        >
          <LeaveRequestForm
            modal
            requestId={openRequestId ?? undefined}
            onClose={() => setOpenRequestId(undefined)}
            onSuccess={() => setOpenRequestId(undefined)}
          />
        </Modal>
      )}
      {requestToDelete && (
        <ConfirmDialog
          title="Delete leave request?"
          message={`Are you sure you want to permanently delete your ${requestToDelete.leaveType.toLowerCase()} request?`}
          isPending={deleteMutation.isPending}
          onCancel={() => setRequestToDelete(null)}
          onConfirm={() => deleteMutation.mutate(requestToDelete.id)}
        />
      )}
    </OmPageShell>
  );
}
