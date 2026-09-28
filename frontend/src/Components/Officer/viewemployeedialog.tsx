"use client";

import Modal from "@/Components/Shared/Modal";
import type { EmployeeRecord } from "@/Types/employee";

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value))
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

export default function ViewEmployeeDialog({
  employee,
  onClose,
}: {
  employee: EmployeeRecord | null;
  onClose: () => void;
}) {
  if (!employee) return null;

  const details = [
    ["Full name", employee.name],
    ["Employee ID", employee.employeeId],
    ["Email", employee.email],
    ["Phone", employee.phone],
    ["Role", employee.role],
    ["Account status", employee.accountStatus],
    ["Department", employee.department],
    ["Designation", employee.designation],
    ["Employment type", employee.employmentType],
    ["Employment status", employee.employmentStatus],
    ["Join date", formatDate(employee.joinDate)],
    ["Work location", employee.workLocation],
    ["Manager / supervisor", employee.manager],
    ["Basic salary", formatMoney(employee.basicSalary)],
    ["Salary type", employee.salaryType],
    ["Address", employee.address],
    ["City", employee.city],
    ["Country", employee.country],
    ["Emergency phone", employee.emergencyContactPhone],
  ];

  return (
    <Modal title="Employee details" description="Employee profile and employment information." onClose={onClose}>
      <div className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 font-medium text-slate-700">{value || "—"}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
