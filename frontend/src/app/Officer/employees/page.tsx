"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jsPDF } from "jspdf";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CheckCircle2,
  Download,
  Eye,
  ListFilter,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import ActionMenu from "@/Components/Shared/ActionMenu";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import Modal from "@/Components/Shared/Modal";
import Pagination from "@/Components/Shared/Pagination";
import Table, { type TableColumn } from "@/Components/Shared/Table";
import TableSkeleton from "@/Components/Shared/TableSkeleton";
import ShadcnSelect from "@/Components/Shared/ShadcnSelect";
import { employeeService } from "@/Services/employee.services";
import type { EmployeeRecord } from "@/Types/employee";

const pageSize = 10;

function initials(name: string | null) {
  return (name ?? "Employee")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "—";
}

function formatMoney(value: string | null) {
  return value
    ? new Intl.NumberFormat("en", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(Number(value))
    : "—";
}

export default function EmployeesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [status, setStatus] = useState("All statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingEmployee, setViewingEmployee] = useState<EmployeeRecord | null>(
    null,
  );
  const [deletingEmployee, setDeletingEmployee] =
    useState<EmployeeRecord | null>(null);
  const [actionError, setActionError] = useState("");
  const queryClient = useQueryClient();
  const employeeQuery = useQuery({
    queryKey: ["officer-employees"],
    queryFn: employeeService.list,
  });
  const employees = useMemo(
    () => employeeQuery.data ?? [],
    [employeeQuery.data],
  );
  const refreshEmployees = () =>
    queryClient.invalidateQueries({ queryKey: ["officer-employees"] });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      accountStatus,
    }: {
      id: string;
      accountStatus: "Active" | "Suspended";
    }) => employeeService.setAccountStatus(id, accountStatus),
    onSuccess: () => void refreshEmployees(),
    onError: (error) =>
      setActionError(
        axios.isAxiosError(error)
          ? (error.response?.data?.message ??
              "Could not update employee status.")
          : "Could not update employee status.",
      ),
  });
  const deleteMutation = useMutation({
    mutationFn: employeeService.remove,
    onSuccess: () => {
      setDeletingEmployee(null);
      void refreshEmployees();
    },
    onError: (error) =>
      setActionError(
        axios.isAxiosError(error)
          ? (error.response?.data?.message ?? "Could not delete employee.")
          : "Could not delete employee.",
      ),
  });

  const departments = useMemo(
    () =>
      [
        ...new Set(
          employees.map((employee) => employee.department).filter(Boolean),
        ),
      ] as string[],
    [employees],
  );
  const statuses = useMemo(
    () =>
      [
        ...new Set(
          employees.map((employee) => employee.accountStatus).filter(Boolean),
        ),
      ] as string[],
    [employees],
  );
  const filteredEmployees = useMemo(() => {
    const search = query.trim().toLowerCase();
    return employees.filter((employee) => {
      const text = [
        employee.name,
        employee.email,
        employee.employeeId,
        employee.department,
        employee.designation,
        employee.role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!search || text.includes(search)) &&
        (department === "All departments" ||
          employee.department === department) &&
        (status === "All statuses" || employee.accountStatus === status)
      );
    });
  }, [department, employees, query, status]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / pageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEmployees = filteredEmployees.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const columns: TableColumn<EmployeeRecord>[] = [
    {
      id: "employee",
      header: "Employee",
      className: "min-w-[290px]",
      cell: (employee) => (
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#17665c] text-[10px] font-bold text-white">
            {employee.profilePic ? (
              <Image
                src={employee.profilePic}
                alt=""
                width={36}
                height={36}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              initials(employee.name)
            )}
          </span>
          <div>
            <p className="font-semibold text-[#35414a]">
              {employee.name ?? "—"}
            </p>
            <p className="mt-0.5 text-xs text-[#849099]">
              {employee.employeeId} · {employee.email ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "department",
      header: "Department",
      className: "min-w-[135px]",
      cell: (employee) => employee.department ?? "—",
    },
    {
      id: "designation",
      header: "Designation",
      className: "min-w-[165px]",
      cell: (employee) => employee.designation ?? "—",
    },
    {
      id: "type",
      header: "Type",
      className: "min-w-[115px]",
      cell: (employee) => employee.employmentType ?? "—",
    },
    {
      id: "joined",
      header: "Joined",
      className: "min-w-[125px]",
      cell: (employee) => formatDate(employee.joinDate),
    },
    {
      id: "salary",
      header: "Basic salary",
      className: "min-w-[125px] font-semibold",
      cell: (employee) => formatMoney(employee.basicSalary),
    },
    {
      id: "status",
      header: "Status",
      className: "min-w-[110px]",
      cell: (employee) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${employee.accountStatus === "Active" ? "bg-[#e8f2ed] text-[#3e806a]" : "bg-[#fff4df] text-[#b47c1f]"}`}
        >
          {employee.accountStatus ?? "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "min-w-[85px]",
      cell: (employee) => (
        <ActionMenu
          items={[
            {
              label: "View",
              icon: Eye,
              onClick: () => setViewingEmployee(employee),
            },
            {
              label: "Edit",
              icon: Pencil,
              onClick: () =>
                router.push(`/Officer/employees/${employee.id}`),
            },
            employee.accountStatus === "Suspended"
              ? {
                  label: "Activate",
                  icon: CheckCircle2,
                  onClick: () =>
                    statusMutation.mutate({
                      id: employee.id,
                      accountStatus: "Active",
                    }),
                }
              : {
                  label: "Suspend",
                  icon: Ban,
                  onClick: () =>
                    statusMutation.mutate({
                      id: employee.id,
                      accountStatus: "Suspended",
                    }),
                },
            {
              label: "Delete",
              icon: Trash2,
              danger: true,
              onClick: () => setDeletingEmployee(employee),
            },
          ]}
        />
      ),
    },
  ];

  function resetPage(action: () => void) {
    action();
    setCurrentPage(1);
  }

  function exportPdf() {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    pdf.setFontSize(16);
    pdf.text("SalaryFlow — Employees", 40, 42);
    pdf.setFontSize(9);
    pdf.text("Employee", 40, 68);
    pdf.text("Department", 175, 68);
    pdf.text("Designation", 285, 68);
    pdf.text("Type", 415, 68);
    pdf.text("Status", 500, 68);
    pdf.text("Email", 585, 68);
    let y = 86;
    filteredEmployees.forEach((employee) => {
      if (y > 550) {
        pdf.addPage();
        y = 42;
      }
      const values = [
        employee.name ?? "—",
        employee.department ?? "—",
        employee.designation ?? "—",
        employee.employmentType ?? "—",
        employee.accountStatus ?? "—",
        employee.email ?? "—",
      ];
      const positions = [40, 175, 285, 415, 500, 585];
      values.forEach((value, valueIndex) =>
        pdf.text(String(value).slice(0, 22), positions[valueIndex], y),
      );
      pdf.setDrawColor(225);
      pdf.line(40, y + 7, 790, y + 7);
      y += 19;
    });
    pdf.save("employees.pdf");
  }

  return (
    <section className="min-w-0">
      <div className="border-b border-[#e5ebea] bg-white px-4 py-5 sm:px-6 lg:px-9 lg:py-6">
        <p className="text-xs text-[#849099]">
          SalaryFlow <span className="mx-2 text-[#a7afb5]">›</span>{" "}
          <span className="font-semibold text-[#4b5760]">Employees</span>
        </p>
        <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.035em] text-[#202b35]">
          Employees
        </h1>
      </div>
      <div className="border-b border-[#e5ebea] bg-white px-4 py-4 sm:px-6 lg:px-9">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:flex lg:flex-wrap lg:items-center">
          <ListFilter
            className="hidden shrink-0 text-[#71808a] sm:block"
            size={21}
          />
          <label className="col-span-2 flex h-10 min-w-52.5 items-center gap-2 rounded-lg border border-[#e0e6e5] px-3 text-[#929da6] md:col-span-4 lg:min-w-65 lg:flex-1">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) =>
                resetPage(() => setQuery(event.target.value))
              }
              placeholder="Search name, email, ID..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-[#98a3ab]"
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
          <div className="contents">
            <button
              type="button"
              onClick={exportPdf}
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-[#dfe6e5] px-3 text-xs font-semibold text-[#52606a]"
            >
              <Download size={16} /> Export PDF
            </button>
            <Link
              href="/Officer/employees/new"
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#1d625b] px-3 text-xs font-semibold text-white transition hover:bg-[#174f4a]"
            >
              <Plus size={16} /> Add employee
            </Link>
          </div>
        </div>
      </div>
      <div className="mb-5 overflow-hidden bg-white">
        {actionError ? (
          <p className="mx-4 mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {actionError}
          </p>
        ) : null}
        {employeeQuery.isPending || employeeQuery.isError ? (
          <TableSkeleton rows={8} />
        ) : (
          <>
            <Table
              columns={columns}
              data={paginatedEmployees}
              getRowId={(employee) => employee.id}
              selectable
              emptyMessage="No employees match your filters."
            />
            <Pagination
              currentPage={safeCurrentPage}
              totalItems={filteredEmployees.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
      {viewingEmployee ? (
        <Modal
          title="Employee details"
          onClose={() => setViewingEmployee(null)}
        >
          <div className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            {[
              ["Full name", viewingEmployee.name],
              ["Employee ID", viewingEmployee.employeeId],
              ["Email", viewingEmployee.email],
              ["Phone", viewingEmployee.phone],
              ["Role", viewingEmployee.role],
              ["Account status", viewingEmployee.accountStatus],
              ["Department", viewingEmployee.department],
              ["Designation", viewingEmployee.designation],
              ["Employment type", viewingEmployee.employmentType],
              ["Employment status", viewingEmployee.employmentStatus],
              ["Join date", formatDate(viewingEmployee.joinDate)],
              ["Work location", viewingEmployee.workLocation],
              ["Manager / supervisor", viewingEmployee.manager],
              ["Basic salary", formatMoney(viewingEmployee.basicSalary)],
              ["Salary type", viewingEmployee.salaryType],
              ["Address", viewingEmployee.address],
              ["City", viewingEmployee.city],
              ["Country", viewingEmployee.country],
              ["Emergency phone", viewingEmployee.emergencyContactPhone],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </p>
                <p className="mt-1 font-medium text-slate-700">
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}
      {deletingEmployee ? (
        <ConfirmDialog
          title="Delete employee?"
          message={`This will permanently delete ${deletingEmployee.name ?? "this employee"} and their related records.`}
          isPending={deleteMutation.isPending}
          onCancel={() => setDeletingEmployee(null)}
          onConfirm={() => deleteMutation.mutate(deletingEmployee.id)}
        />
      ) : null}
    </section>
  );
}
