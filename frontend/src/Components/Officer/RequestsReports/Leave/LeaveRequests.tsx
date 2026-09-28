"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { officerRequestsService } from "@/Services/officer-requests.services";
import Pagination from "@/Components/Shared/Pagination";
import DataLoadError from "@/Components/Shared/DataLoadError";
import {
  RequestTableSkeleton,
  SimpleTable,
  StatusBadge,
  TableCell,
  TableRow,
} from "../Shared";
const date = (v: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(v));
export default function LeaveRequests() {
  const qc = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const q = useQuery({
    queryKey: ["officer-leave", currentPage],
    queryFn: () => officerRequestsService.leave(currentPage, pageSize),
    staleTime: 0,
  });
  const m = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => officerRequestsService.setLeave(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["officer-leave"] }),
  });
  const rows = q.data?.items ?? [];
  const total = q.data?.total ?? 0;
  if (q.isError) return <div className="p-4"><DataLoadError retry={() => void q.refetch()} /></div>;
  return (
    <div>
      <SimpleTable
        className="min-h-[70vh]"
        headers={["Employee", "Type", "Date", "Days", "Status", "Actions"]}
      >
        {q.isPending ? <RequestTableSkeleton columns={6} /> : rows.map((r) => {
          const days = Math.max(
            1,
            Math.ceil(
              (new Date(r.endDate).getTime() -
                new Date(r.startDate).getTime()) /
                86400000,
            ) + 1,
          );
          return (
            <TableRow key={r.id}>
              <TableCell>
                <b>{r.user.name ?? r.user.employeeId}</b>
              </TableCell>
              <TableCell>{r.leaveType}</TableCell>
              <TableCell>
                {date(r.startDate)} – {date(r.endDate)}
              </TableCell>
              <TableCell>{days}</TableCell>
              <TableCell>
                <StatusBadge
                  status={r.status[0] + r.status.slice(1).toLowerCase()}
                />
              </TableCell>
              <TableCell>
                {r.status === "PENDING" ? (
                  <span className="flex gap-2">
                    <button
                      onClick={() => m.mutate({ id: r.id, status: "APPROVED" })}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => m.mutate({ id: r.id, status: "REJECTED" })}
                    >
                      <X size={18} />
                    </button>
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </SimpleTable>
      <Pagination
        currentPage={currentPage}
        totalItems={total}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        className="pb-8"
      />
    </div>
  );
}
