"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { officerRequestsService } from "@/Services/officer-requests.services";
import Pagination from "@/Components/Shared/Pagination";
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
  const q = useQuery({
    queryKey: ["officer-leave"],
    queryFn: officerRequestsService.leave,
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
  const rows = q.data ?? [];
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = rows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  return (
    <div>
      <SimpleTable
        className="min-h-[70vh]"
        headers={["Employee", "Type", "Date", "Days", "Status", "Actions"]}
      >
        {q.isPending ? <RequestTableSkeleton columns={6} /> : paginatedRows.map((r) => {
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
        currentPage={safePage}
        totalItems={rows.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        className="pb-8"
      />
    </div>
  );
}
