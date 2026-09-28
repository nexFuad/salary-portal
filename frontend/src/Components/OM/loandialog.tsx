"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "@/Components/Shared/Modal";
import ShadcnSelect from "@/Components/Shared/ShadcnSelect";
import { loanService } from "@/Services/om.services";
import type { LoanDialogProps, LoanForm } from "@/Types/loan";

const fresh = (): LoanForm => ({
  loanType: "Personal Loan",
  requestedAmount: "",
  purpose: "",
  monthlyInstallment: "",
  preferredStartDate: new Date().toISOString().slice(0, 10),
  note: "",
  requestDate: new Date().toISOString().slice(0, 10),
});

const formattedDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";

const repaymentPlan = (amount: string, installment: string) => {
  const requested = Number(amount);
  const monthly = Number(installment);
  return requested > 0 && monthly > 0 ? Math.ceil(requested / monthly) : 0;
};

const planEndDate = (startDate: string, months: number) => {
  if (!startDate || !months) return null;
  const date = new Date(`${startDate}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months - 1);
  return date.toISOString().slice(0, 10);
};

export default function LoanDialog({ editing, onClose }: LoanDialogProps) {
  const client = useQueryClient();
  const [form, setForm] = useState<LoanForm>(() => editing ? {
    loanType: editing.loanType,
    requestedAmount: editing.requestedAmount,
    purpose: editing.purpose,
    monthlyInstallment: editing.monthlyInstallment,
    preferredStartDate: editing.preferredStartDate.slice(0, 10),
    note: editing.note ?? "",
    requestDate: editing.requestDate.slice(0, 10),
  } : fresh());
  const [error, setError] = useState("");
  const save = useMutation({
    mutationFn: () => editing
      ? loanService.update(editing.id, form)
      : loanService.create(form),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["loans"] });
      onClose();
    },
    onError: () => setError("Could not save loan request."),
  });

  return (
    <Modal
      title={editing ? "Edit loan request" : "Request loan"}
      onClose={() => !save.isPending && onClose()}
    >
      <form
        className="grid max-h-[calc(100dvh-12rem)] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 [&_input]:border-slate-200 [&_input]:bg-white [&_input]:outline-none [&_input]:focus:border-[#2c7469] [&_select]:border-slate-200 [&_select]:bg-white [&_select]:outline-none [&_select]:focus:border-[#2c7469] [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:outline-none [&_textarea]:focus:border-[#2c7469]"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          save.mutate();
        }}
      >
        <label className="text-sm font-medium text-slate-700">
          Loan type
          <ShadcnSelect
            value={form.loanType}
            onValueChange={(loanType) => setForm({ ...form, loanType })}
            className="mt-1.5"
            options={[
              "Personal Loan",
              "Emergency Loan",
              "Medical/Family Support",
              "Other",
            ].map((value) => ({ label: value, value }))}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Requested amount
          <input
            required
            min="1"
            type="number"
            step="0.01"
            placeholder="e.g. 10000"
            value={form.requestedAmount}
            onChange={(e) =>
              setForm({ ...form, requestedAmount: e.target.value })
            }
            className="mt-1.5 h-11 w-full rounded-xl border px-3 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Monthly installment amount
          <input
            required
            min="1"
            step="0.01"
            type="number"
            placeholder="e.g. 2000"
            value={form.monthlyInstallment}
            onChange={(e) =>
              setForm({ ...form, monthlyInstallment: e.target.value })
            }
            className="mt-1.5 h-11 w-full rounded-xl border px-3 text-sm"
          />
        </label>
        <div className="text-sm font-medium text-slate-700">
          Repayment months
          <div className="mt-1.5 flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
            {repaymentPlan(form.requestedAmount, form.monthlyInstallment)
              ? `${repaymentPlan(form.requestedAmount, form.monthlyInstallment)} months (automatic)`
              : "Set amount and monthly payment"}
          </div>
        </div>
        <label className="text-sm font-medium text-slate-700">
          Preferred start date
          <input
            required
            type="date"
            value={form.preferredStartDate}
            onChange={(e) =>
              setForm({ ...form, preferredStartDate: e.target.value })
            }
            className="mt-1.5 h-11 w-full rounded-xl border px-3 text-sm"
          />
        </label>
        <div className="text-sm font-medium text-slate-700">
          Estimated end date
          <div className="mt-1.5 flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
            {formattedDate(
              planEndDate(
                form.preferredStartDate,
                repaymentPlan(
                  form.requestedAmount,
                  form.monthlyInstallment,
                ),
              ),
            )}
          </div>
        </div>
        <label className="sm:col-span-2 text-sm font-medium text-slate-700">
          Purpose
          <textarea
            required
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            className="mt-1.5 min-h-16 w-full rounded-xl border p-3 text-sm"
          />
        </label>
        <label className="sm:col-span-2 text-sm font-medium text-slate-700">
          Additional note
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="mt-1.5 min-h-16 w-full rounded-xl border p-3 text-sm"
          />
        </label>
        {error && (
          <p className="sm:col-span-2 text-sm text-rose-600">{error}</p>
        )}
        <div className="flex gap-3 sm:col-span-2">
          <button
            disabled={save.isPending}
            className="rounded-xl bg-[#17665c] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#105348] disabled:opacity-60"
          >
            {save.isPending
              ? "Saving…"
              : editing
                ? "Update request"
                : "Submit request"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={save.isPending}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
