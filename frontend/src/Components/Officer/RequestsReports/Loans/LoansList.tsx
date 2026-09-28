"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import Pagination from "@/Components/Shared/Pagination";
import DataLoadError from "@/Components/Shared/DataLoadError";
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

export default function LoansList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const loansQuery = useQuery({
    queryKey: ["officer-loans", page],
    queryFn: () => officerRequestsService.loans(page, pageSize),
    staleTime: 0,
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => officerRequestsService.setLoan(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["officer-loans"] }),
  });

  const rows = loansQuery.data?.items ?? [];
  const total = loansQuery.data?.total ?? 0;
  if (loansQuery.isError) return <div className="p-4"><DataLoadError retry={() => void loansQuery.refetch()} /></div>;

  return (
    <div>
      <div className="border-b border-[#e7edec] bg-white px-5 py-4 text-[16px] font-bold text-[#29343d]">
        Loan requests
      </div>
      <SimpleTable
        className="min-h-[70vh]"
        headers={[
          "Employee",
          "Loan type",
          "Amount",
          "Installments",
          "Purpose",
          "Status",
          "Actions",
        ]}
      >
        {loansQuery.isPending ? <RequestTableSkeleton columns={7} /> : rows.map((loan) => {
          const status = loan.status[0] + loan.status.slice(1).toLowerCase();

          return (
            <TableRow key={loan.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {loan.user.profilePic ? (
                    <Image
                      src={loan.user.profilePic}
                      alt=""
                      width={32}
                      height={32}
                      unoptimized
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-8 place-items-center rounded-full bg-[#17665c] text-xs font-semibold text-white">
                      {(loan.user.name ?? loan.user.employeeId)
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-[#3b4650]">
                      {loan.user.name ?? loan.user.employeeId}
                    </p>
                    <p className="text-xs text-slate-500">
                      {loan.user.employeeId}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{loan.loanType}</TableCell>
              <TableCell>{formatMoney(loan.requestedAmount)}</TableCell>
              <TableCell>
                {formatMoney(loan.monthlyInstallment)} monthly /{" "}
                {loan.repaymentMonths} months
              </TableCell>
              <TableCell>{loan.purpose}</TableCell>
              <TableCell>
                <StatusBadge status={status} />
              </TableCell>
              <TableCell>
                {loan.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate({
                          id: loan.id,
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
                          id: loan.id,
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
                    {loan.approvedAmount
                      ? `Approved: ${formatMoney(loan.approvedAmount)}`
                      : "Reviewed"}
                  </span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </SimpleTable>
      <Pagination
        currentPage={page}
        totalItems={total}
        pageSize={pageSize}
        onPageChange={setPage}
        className="pb-8"
      />
    </div>
  );
}
