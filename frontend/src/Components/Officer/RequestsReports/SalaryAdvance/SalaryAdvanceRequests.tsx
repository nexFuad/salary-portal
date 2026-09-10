"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import Pagination from "@/Components/Shared/Pagination";
import { officerRequestsService } from "@/Services/officer-requests.services";
import {
  RequestTableSkeleton,
  SimpleTable,
  StatusBadge,
  TableCell,
  TableRow,
} from "../Shared";

const pageSize = 10;

function formatMoney(value: string | null) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export default function SalaryAdvanceRequests() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const requestsQuery = useQuery({
    queryKey: ["officer-salary-advances"],
    queryFn: officerRequestsService.salaryAdvances,
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => officerRequestsService.setSalaryAdvance(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["officer-salary-advances"],
      }),
  });

  const requests = requestsQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(requests.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = requests.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div>
      <div className="border-b border-[#e7edec] bg-white px-5 py-4 text-[16px] font-bold text-[#29343d]">
        Salary advance requests
      </div>
      <SimpleTable
        className="min-h-[70vh]"
        headers={[
          "Employee",
          "Amount",
          "Reason",
          "Repayment",
          "Request date",
          "Status",
          "Actions",
        ]}
      >
        {requestsQuery.isPending ? <RequestTableSkeleton columns={7} /> : rows.map((request) => {
          const status =
            request.status[0] + request.status.slice(1).toLowerCase();

          return (
            <TableRow key={request.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {request.user.profilePic ? (
                    <img
                      src={request.user.profilePic}
                      alt=""
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-8 place-items-center rounded-full bg-[#17665c] text-xs font-semibold text-white">
                      {(request.user.name ?? request.user.employeeId)
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-[#3b4650]">
                      {request.user.name ?? request.user.employeeId}
                    </p>
                    <p className="text-xs text-slate-500">
                      {request.user.employeeId}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatMoney(request.requestedAmount)}</TableCell>
              <TableCell>{request.reason}</TableCell>
              <TableCell>{request.repaymentMonths} months</TableCell>
              <TableCell>
                {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                  new Date(request.requestDate),
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={status} />
              </TableCell>
              <TableCell>
                {request.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate({
                          id: request.id,
                          status: "APPROVED",
                        })
                      }
                      title="Approve request"
                      aria-label="Approve request"
                      className="rounded-lg border border-[#dfe6e5] p-2 text-emerald-700 disabled:opacity-50"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate({
                          id: request.id,
                          status: "REJECTED",
                        })
                      }
                      title="Reject request"
                      aria-label="Reject request"
                      className="rounded-lg p-2 text-rose-600 disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-[#849099]">
                    {request.approvedAmount
                      ? `Approved: ${formatMoney(request.approvedAmount)}`
                      : "Reviewed"}
                  </span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </SimpleTable>
      <Pagination
        currentPage={safePage}
        totalItems={requests.length}
        pageSize={pageSize}
        onPageChange={setPage}
        className="pb-8"
      />
    </div>
  );
}
