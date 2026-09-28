"use client";

import { useState } from "react";
import Modal from "@/Components/Shared/Modal";
import ShadcnSelect from "@/Components/Shared/ShadcnSelect";
import type { PayrollRecord } from "@/Types/payroll";

const money = (value: string) =>
  `৳${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const dateMonth = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

export function PayrollDetailsDialog({
  record,
  onClose,
}: {
  record: PayrollRecord;
  onClose: () => void;
}) {
  const details = [
    ["Employee", record.user.name ?? record.user.employeeId],
    ["Salary month", dateMonth(record.payRunMonth)],
    ["Attendance", `${record.attendedDays}/${record.expectedWorkDays} days`],
    ["Worked hours", `${record.workedHours}h / ${record.expectedWorkHours}h`],
    ["Overtime", `${record.overtimeHours}h · ${money(record.overtimeAmount)}`],
    ["Short hours", `${record.shortHours}h · -${money(record.deductionAmount)}`],
    ["Attendance allowance", money(record.bonusAmount)],
    ["Net salary", money(record.netSalary)],
    ["Status", record.status],
  ];

  return (
    <Modal title="Payroll details" description="Payroll calculation and status for this employee." onClose={onClose}>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 font-medium text-slate-800">{value}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export function PayrollStatusDialog({
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
    <Modal title="Update payroll status" description="Choose the new status for this payroll record." onClose={onClose}>
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
