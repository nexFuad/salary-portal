"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarX2,
  Download,
  Eye,
  LoaderCircle,
  Pencil,
  PlayCircle,
  Search,
  Trash2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import ActionMenu from "@/Components/Shared/ActionMenu";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import { PayrollDetailsDialog, PayrollStatusDialog } from "@/Components/Officer/payroledialoge";
import Pagination from "@/Components/Shared/Pagination";
import ShadcnSelect from "@/Components/Shared/ShadcnSelect";
import Table, { type TableColumn } from "@/Components/Shared/Table";
import TableSkeleton from "@/Components/Shared/TableSkeleton";
import DataLoadError from "@/Components/Shared/DataLoadError";
import { useSearchBar } from "@/Hooks/useSearchBar";
import { payrollService } from "@/Services/payroll.services";
import type { PayrollRecord } from "@/Types/payroll";
import OfficerHeader from "@/Components/Officer/OfficerHeader";

const pageSize = 10;
function previousPayrollMonth() {
  const today = new Date();
  return new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1),
  )
    .toISOString()
    .slice(0, 7);
}
const money = (value: string) =>
  `৳${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const dateMonth = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(value),
  );
const tone = (status: string) =>
  status === "Paid"
    ? "bg-emerald-50 text-emerald-700"
    : status === "Approved"
      ? "bg-teal-50 text-teal-700"
      : "bg-amber-50 text-amber-700";

export default function PayrollPage() {
  const queryClient = useQueryClient();
  const { query, setQuery, searchQuery } = useSearchBar();
  const [department, setDepartment] = useState("All departments");
  const [status, setStatus] = useState("All statuses");
  const [payrollMonth, setPayrollMonth] = useState(previousPayrollMonth);
  const latestPayrollMonth = previousPayrollMonth();
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState<PayrollRecord | null>(null);
  const [editing, setEditing] = useState<PayrollRecord | null>(null);
  const [deleting, setDeleting] = useState<PayrollRecord | null>(null);
  const [message, setMessage] = useState("");
  const listQuery = useQuery({
    queryKey: ["payroll", payrollMonth, searchQuery, department, status, page],
    queryFn: () => payrollService.list({
      payRunMonth: payrollMonth,
      search: searchQuery || undefined,
      department: department === "All departments" ? undefined : department,
      status: status === "All statuses" ? undefined : status,
      page,
      pageSize,
    }),
  });
  const rows = listQuery.data?.records ?? [];
  const totalRecords = listQuery.data?.total ?? 0;
  const departments = listQuery.data?.departments ?? [];
  const statuses = listQuery.data?.statuses ?? [];
  const generateMutation = useMutation({
    mutationFn: payrollService.generate,
    onSuccess: async (result) => {
      setMessage(result.message);
      setPayrollMonth(result.payRunMonth);
      setQuery("");
      setDepartment("All departments");
      setStatus("All statuses");
      setPage(1);
      await queryClient.invalidateQueries({ queryKey: ["payroll"] });
    },
    onError: () =>
      setMessage("Payroll could not be generated. Please try again."),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      payrollService.updateStatus(id, nextStatus),
    onSuccess: async (_result, variables) => {
      setEditing(null);
      if (status !== "All statuses" && variables.nextStatus !== status && rows.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      await queryClient.invalidateQueries({ queryKey: ["payroll"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: payrollService.remove,
    onSuccess: async () => {
      setDeleting(null);
      if (rows.length === 1 && page > 1) setPage((current) => current - 1);
      await queryClient.invalidateQueries({ queryKey: ["payroll"] });
    },
  });

  const resetPage = (callback: () => void) => {
    callback();
    setPage(1);
  };

  const columns: TableColumn<PayrollRecord>[] = [
    {
      id: "employee",
      header: "Employee",
      className: "min-w-[210px]",
      cell: (record) => (
        <div className="flex items-center gap-2.5">
          {record.user.profilePic ? (
            <Image
              src={record.user.profilePic}
              alt=""
              width={32}
              height={32}
              unoptimized
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-8 place-items-center rounded-full bg-[#17665c] text-xs font-semibold text-white">
              {(record.user.name ?? record.user.employeeId)
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-semibold text-slate-700">
              {record.user.name ?? record.user.employeeId}
            </p>
            <p className="text-xs text-slate-500">
              {record.user.department ?? "No department"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "month",
      header: "Month",
      className: "min-w-[135px]",
      cell: (record) => dateMonth(record.payRunMonth),
    },
    {
      id: "basic",
      header: "Basic salary",
      className: "min-w-[125px]",
      cell: (record) => money(record.basicSalary),
    },
    {
      id: "allowance",
      header: "Allowances",
      className: "min-w-[120px]",
      cell: (record) => money(record.bonusAmount),
    },
    {
      id: "overtime",
      header: "Overtime",
      className: "min-w-[120px]",
      cell: (record) => (
        <span className="text-emerald-700">
          +{money(record.overtimeAmount)}
        </span>
      ),
    },
    {
      id: "deductions",
      header: "Deductions",
      className: "min-w-[125px]",
      cell: (record) => (
        <span className="text-rose-600">-{money(record.deductionAmount)}</span>
      ),
    },
    {
      id: "net",
      header: "Net salary",
      className: "min-w-[125px]",
      cell: (record) => (
        <b className="text-slate-800">{money(record.netSalary)}</b>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "min-w-[130px]",
      cell: (record) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone(record.status)}`}
        >
          {record.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (record) => (
        <ActionMenu
          items={[
            {
              label: "View details",
              icon: Eye,
              onClick: () => setDetails(record),
            },
            {
              label: "Edit status",
              icon: Pencil,
              onClick: () => setEditing(record),
            },
            {
              label: "Delete",
              icon: Trash2,
              danger: true,
              onClick: () => setDeleting(record),
            },
          ]}
        />
      ),
    },
  ];

  const exportPdf = () => {
    const pdf = new jsPDF({ orientation: "landscape" });
    pdf.text("SalaryFlow Payroll", 20, 18);
    let y = 30;
    rows.forEach((record) => {
      if (y > 190) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(
        `${record.user.name ?? record.user.employeeId} | ${dateMonth(record.payRunMonth)} | Basic ${money(record.basicSalary)} | Net ${money(record.netSalary)} | ${record.status}`,
        20,
        y,
      );
      y += 9;
    });
    pdf.save("payroll.pdf");
  };

  return (
    <section className="min-w-0">
      <OfficerHeader title="Payroll" />
      <div className="border-b border-[#e5ebea] bg-white px-4 py-4 sm:px-6 lg:px-9">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:flex lg:flex-wrap lg:items-center">
          <label className="col-span-2 flex h-10 min-w-52.5 items-center gap-2 rounded-lg border border-[#e0e6e5] px-3 text-[#929da6] md:col-span-4 lg:min-w-65 lg:flex-1">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) =>
                resetPage(() => setQuery(event.target.value))
              }
              placeholder="Search employee..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-[#98a3ab]"
            />
          </label>
          <label className="flex h-10 items-center rounded-lg border border-[#e0e6e5] bg-white px-3 text-xs font-medium text-[#58646d] lg:w-40 lg:shrink-0">
            <span className="sr-only">Payroll month</span>
            <input
              type="month"
              value={payrollMonth}
              max={latestPayrollMonth}
              onChange={(event) => {
                const selectedMonth = event.target.value;
                if (!/^\d{4}-\d{2}$/.test(selectedMonth) || selectedMonth > latestPayrollMonth) return;
                setPayrollMonth(selectedMonth);
                setQuery("");
                setDepartment("All departments");
                setStatus("All statuses");
                setMessage("");
                setPage(1);
              }}
              className="w-full bg-transparent outline-none"
            />
          </label>
          <ShadcnSelect
            value={department}
            onValueChange={(value) => resetPage(() => setDepartment(value))}
            className="h-10 rounded-lg text-xs font-medium text-[#58646d] lg:w-41.25 lg:shrink-0"
            options={["All departments", ...departments].map((value) => ({
              label: value,
              value,
            }))}
          />
          <ShadcnSelect
            value={status}
            onValueChange={(value) => resetPage(() => setStatus(value))}
            className="h-10 rounded-lg text-xs font-medium text-[#58646d] lg:w-36.25 lg:shrink-0"
            options={["All statuses", ...statuses].map((value) => ({
              label: value,
              value,
            }))}
          />
          <button
            type="button"
            onClick={exportPdf}
            disabled={rows.length === 0}
            className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#dfe6e5] px-3 text-xs font-semibold text-[#52606a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export page PDF
          </button>
          <button
            type="button"
            onClick={() => {
              setMessage("");
              generateMutation.mutate();
            }}
            disabled={generateMutation.isPending}
            className="flex h-10 min-w-40 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#1d625b] px-3 text-xs font-semibold text-white disabled:opacity-60"
          >
            {generateMutation.isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <PlayCircle size={16} />
            )}
            {generateMutation.isPending ? "Generating…" : "Generate payroll"}
          </button>
        </div>
        {message ? (
          <p
            className={`mt-3 text-sm ${generateMutation.isError ? "text-rose-600" : "text-emerald-700"}`}
          >
            {message}
          </p>
        ) : null}
      </div>
      <div className="mb-5 overflow-hidden bg-white">
        {listQuery.isError ? (
          <div className="p-4"><DataLoadError retry={() => void listQuery.refetch()} /></div>
        ) : listQuery.isPending ? (
          <TableSkeleton rows={8} />
        ) : listQuery.data?.monthTotal === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center" role="status">
            <span className="grid size-14 place-items-center rounded-2xl bg-[#e8f2ef] text-[#1d625b]">
              <CalendarX2 size={27} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-lg font-bold text-[#26343c]">No payroll found for {dateMonth(`${payrollMonth}-01`)}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#77838d]">There are no payroll records for this month. Generate payroll creates records for the previous month.</p>
          </div>
        ) : totalRecords === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-[#77838d]" role="status">
            No payroll records match your search or filters for {dateMonth(`${payrollMonth}-01`)}.
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={rows}
              getRowId={(record) => record.id}
            />
            <Pagination
              currentPage={page}
              totalItems={totalRecords}
              pageSize={pageSize}
              onPageChange={setPage}
              className="pb-8"
            />
          </>
        )}
      </div>
      {details ? (
        <PayrollDetailsDialog record={details} onClose={() => setDetails(null)} />
      ) : null}
      {editing ? (
        <PayrollStatusDialog
          record={editing}
          isPending={statusMutation.isPending}
          onClose={() => setEditing(null)}
          onSave={(nextStatus) =>
            statusMutation.mutate({ id: editing.id, nextStatus })
          }
        />
      ) : null}
      {deleting ? (
        <ConfirmDialog
          title="Delete payroll record?"
          message="This payroll calculation will be permanently deleted."
          isPending={deleteMutation.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => deleteMutation.mutate(deleting.id)}
        />
      ) : null}
    </section>
  );
}
