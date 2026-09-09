"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Eye,
  ListFilter,
  Pencil,
  PlayCircle,
  Search,
  Trash2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import ActionMenu from "@/Components/Shared/ActionMenu";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import Modal from "@/Components/Shared/Modal";
import Pagination from "@/Components/Shared/Pagination";
import ShadcnSelect from "@/Components/Shared/ShadcnSelect";
import Table, { type TableColumn } from "@/Components/Shared/Table";
import TableSkeleton from "@/Components/Shared/TableSkeleton";
import { payrollService } from "@/Services/payroll.services";
import type { PayrollRecord } from "@/Types/payroll";

const pageSize = 10;
const money = (value: string) =>
  `৳${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const dateMonth = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
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
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState<PayrollRecord | null>(null);
  const [editing, setEditing] = useState<PayrollRecord | null>(null);
  const [deleting, setDeleting] = useState<PayrollRecord | null>(null);
  const [message, setMessage] = useState("");
  const listQuery = useQuery({
    queryKey: ["payroll"],
    queryFn: payrollService.list,
  });
  const records = listQuery.data ?? [];
  const generateMutation = useMutation({
    mutationFn: payrollService.generate,
    onSuccess: async (result) => {
      setMessage(result.message);
      await queryClient.invalidateQueries({ queryKey: ["payroll"] });
    },
    onError: () =>
      setMessage("Payroll could not be generated. Please try again."),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      payrollService.updateStatus(id, nextStatus),
    onSuccess: async () => {
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["payroll"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: payrollService.remove,
    onSuccess: async () => {
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: ["payroll"] });
    },
  });

  const departments = useMemo(
    () =>
      [
        ...new Set(
          records.map((record) => record.user.department).filter(Boolean),
        ),
      ] as string[],
    [records],
  );
  const statuses = useMemo(
    () => [...new Set(records.map((record) => record.status))],
    [records],
  );
  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch = [
          record.user.name,
          record.user.email,
          record.user.employeeId,
          record.user.department,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
        return (
          matchesSearch &&
          (department === "All departments" ||
            record.user.department === department) &&
          (status === "All statuses" || record.status === status)
        );
      }),
    [records, query, department, status],
  );
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filteredRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
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
            <img
              src={record.user.profilePic}
              alt=""
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
    filteredRecords.forEach((record) => {
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
      <div className="border-b border-[#e5ebea] bg-white px-4 py-5 sm:px-6 lg:px-9 lg:py-6">
        <p className="text-xs text-[#849099]">
          SalaryFlow <span className="mx-2 text-[#a7afb5]">›</span>
          <span className="font-semibold text-[#4b5760]">Payroll</span>
        </p>
        <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.035em] text-[#202b35]">
          Payroll
        </h1>
      </div>
      <div className="border-b border-[#e5ebea] bg-white px-4 py-4 sm:px-6 lg:px-9">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:flex lg:flex-wrap lg:items-center">
          <ListFilter
            className="hidden shrink-0 text-[#71808a] sm:block"
            size={21}
          />
          <label className="col-span-2 flex h-10 min-w-[210px] items-center gap-2 rounded-lg border border-[#e0e6e5] px-3 text-[#929da6] md:col-span-4 lg:min-w-[260px] lg:flex-1">
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
          <ShadcnSelect
            value={department}
            onValueChange={(value) => resetPage(() => setDepartment(value))}
            className="h-10 rounded-lg text-xs font-medium text-[#58646d] lg:w-[165px] lg:shrink-0"
            options={["All departments", ...departments].map((value) => ({
              label: value,
              value,
            }))}
          />
          <ShadcnSelect
            value={status}
            onValueChange={(value) => resetPage(() => setStatus(value))}
            className="h-10 rounded-lg text-xs font-medium text-[#58646d] lg:w-[145px] lg:shrink-0"
            options={["All statuses", ...statuses].map((value) => ({
              label: value,
              value,
            }))}
          />
          <button
            type="button"
            onClick={exportPdf}
            className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#dfe6e5] px-3 text-xs font-semibold text-[#52606a]"
          >
            <Download size={16} />
            Export PDF
          </button>
          <button
            type="button"
            onClick={() => {
              setMessage("");
              generateMutation.mutate();
            }}
            disabled={generateMutation.isPending}
            className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#1d625b] px-3 text-xs font-semibold text-white disabled:opacity-60"
          >
            <PlayCircle size={16} />
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
        {listQuery.isPending ? (
          <TableSkeleton rows={8} />
        ) : (
          <>
            <Table
              columns={columns}
              data={rows}
              getRowId={(record) => record.id}
              emptyMessage="No payroll records found. Generate payroll to calculate the previous month's attendance."
            />
            <Pagination
              currentPage={safePage}
              totalItems={filteredRecords.length}
              pageSize={pageSize}
              onPageChange={setPage}
              className="pb-8"
            />
          </>
        )}
      </div>
      {details ? (
        <Modal title="Payroll details" onClose={() => setDetails(null)}>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Employee", details.user.name ?? details.user.employeeId],
              ["Salary month", dateMonth(details.payRunMonth)],
              [
                "Attendance",
                `${details.attendedDays}/${details.expectedWorkDays} days`,
              ],
              [
                "Worked hours",
                `${details.workedHours}h / ${details.expectedWorkHours}h`,
              ],
              [
                "Overtime",
                `${details.overtimeHours}h · ${money(details.overtimeAmount)}`,
              ],
              [
                "Short hours",
                `${details.shortHours}h · -${money(details.deductionAmount)}`,
              ],
              ["Attendance allowance", money(details.bonusAmount)],
              ["Net salary", money(details.netSalary)],
              ["Status", details.status],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 font-medium text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}
      {editing ? (
        <StatusEditor
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

function StatusEditor({
  record,
  isPending,
  onClose,
  onSave,
}: {
  record: PayrollRecord;
  isPending: boolean;
  onClose: () => void;
  onSave: (status: string) => void;
}) {
  const [status, setStatus] = useState(record.status);
  return (
    <Modal title="Update payroll status" onClose={onClose}>
      <div className="space-y-5">
        <ShadcnSelect
          value={status}
          onValueChange={setStatus}
          options={["Pending approval", "Approved", "Paid"].map((value) => ({
            label: value,
            value,
          }))}
        />
        <div className="flex gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => onSave(status)}
            className="rounded-xl bg-[#17665c] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save status"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
