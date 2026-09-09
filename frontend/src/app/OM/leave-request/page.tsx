"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import LeaveRequestForm from "@/Components/OM/LeaveRequestForm";
import OmPageShell from "@/Components/OM/OmPageShell";
import ActionMenu from "@/Components/Shared/ActionMenu";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import Modal from "@/Components/Shared/Modal";
import OmTable from "@/Components/Shared/OmTable";
import TableSkeleton from "@/Components/Shared/TableSkeleton";
import { type TableColumn } from "@/Components/Shared/Table";
import { leaveRequestService } from "@/Services/leave-request.services";
import type { LeaveRequest } from "@/Types/leave-request";

const pageSize = 10;
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
  const [currentPage, setCurrentPage] = useState(1);
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
  const totalPages = Math.max(1, Math.ceil(requests.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const visibleRequests = requests.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const columns: TableColumn<LeaveRequest>[] = [
    {
      id: "type",
      header: "Leave type",
      cell: (request) => (
        <span className="font-medium text-slate-700">{request.leaveType}</span>
      ),
    },
    { id: "reason", header: "Reason", cell: (request) => request.reason },
    {
      id: "dates",
      header: "Date range",
      cell: (request) => (
        <span className="whitespace-nowrap">
          {formatDate(request.startDate)} – {formatDate(request.endDate)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (request) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(request.status)}`}
        >
          {request.status[0] + request.status.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      id: "submitted",
      header: "Submitted",
      cell: (request) => formatDate(request.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (request) => {
        if (request.status !== "PENDING") {
          return <span className="text-xs text-slate-400">—</span>;
        }

        return (
          <ActionMenu
            items={[
              {
                label: "Edit",
                icon: Pencil,
                onClick: () => setOpenRequestId(request.id),
              },
              {
                label: "Delete",
                icon: Trash2,
                danger: true,
                onClick: () => setRequestToDelete(request),
              },
            ]}
          />
        );
      },
    },
  ];

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
      {isPending ? (
        <TableSkeleton rows={8} />
      ) : isError ? (
        <div className="min-h-[70vh] rounded-2xl border border-slate-200 bg-white p-6 text-sm text-rose-600">
          Could not load leave requests. Please try again.
        </div>
      ) : (
        <OmTable
          columns={columns}
          data={visibleRequests}
          getRowId={(request) => request.id}
          emptyMessage="No leave request found."
          currentPage={page}
          totalItems={requests.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
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
