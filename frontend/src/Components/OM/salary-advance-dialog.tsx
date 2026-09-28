"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "@/Components/Shared/Modal";
import { salaryAdvanceService } from "@/Services/om.services";
import type { SalaryAdvanceDialogProps, SalaryAdvanceForm } from "@/Types/salary-advance";

const initialForm = (): SalaryAdvanceForm => ({
  requestedAmount: "",
  repaymentMonths: "",
  reason: "",
  note: "",
  requestDate: new Date().toISOString().slice(0, 10),
});

export default function SalaryAdvanceDialog({ editing, onClose }: SalaryAdvanceDialogProps) {
  const client = useQueryClient();
  const [form, setForm] = useState<SalaryAdvanceForm>(() => editing ? {
    requestedAmount: editing.requestedAmount,
    repaymentMonths: String(editing.repaymentMonths),
    reason: editing.reason,
    note: editing.note ?? "",
    requestDate: editing.requestDate.slice(0, 10),
  } : initialForm());
  const [error, setError] = useState("");
  const save = useMutation({
    mutationFn: () => editing
      ? salaryAdvanceService.update(editing.id, { ...form, repaymentMonths: Number(form.repaymentMonths) })
      : salaryAdvanceService.create({ ...form, repaymentMonths: Number(form.repaymentMonths) }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["salary-advances"] });
      onClose();
    },
    onError: () => setError("Could not save your salary advance request."),
  });

  return (
    <Modal
      title={editing ? "Edit salary advance" : "Request salary advance"}
      onClose={() => !save.isPending && onClose()}
    >
      <form
        className="grid gap-2.5 sm:grid-cols-2 [&_input]:border-slate-200 [&_input]:bg-white [&_input]:outline-none [&_input]:focus:border-[#2c7469] [&_select]:border-slate-200 [&_select]:bg-white [&_select]:outline-none [&_select]:focus:border-[#2c7469] [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:outline-none [&_textarea]:focus:border-[#2c7469]"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          save.mutate();
        }}
      >
        <label className="text-sm font-medium text-slate-700">
          Requested amount
          <input
            required
            type="text"
            inputMode="decimal"
            placeholder="e.g. 10000"
            value={form.requestedAmount}
            onChange={(e) =>
              setForm({ ...form, requestedAmount: e.target.value })
            }
            className="mt-1 h-10 w-full rounded-xl border px-3 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Repayment months
          <input
            required
            type="text"
            inputMode="numeric"
            placeholder="e.g. 3"
            value={form.repaymentMonths}
            onChange={(e) =>
              setForm({ ...form, repaymentMonths: e.target.value })
            }
            className="mt-1 h-10 w-full rounded-xl border px-3 text-sm"
          />
        </label>
        <label className="sm:col-span-2 text-sm font-medium text-slate-700">
          Reason
          <textarea
            required
            placeholder="Briefly explain why you need the advance"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="mt-1 min-h-16 w-full rounded-xl border p-2.5 text-sm"
          />
        </label>
        <label className="sm:col-span-2 text-sm font-medium text-slate-700">
          Additional note{" "}
          <span className="font-normal text-slate-400">(optional)</span>
          <textarea
            placeholder="Add any extra information for your manager"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="mt-1 min-h-16 w-full rounded-xl border p-2.5 text-sm"
          />
        </label>
        {error && (
          <p className="sm:col-span-2 text-sm text-rose-600">{error}</p>
        )}
        <div className="flex gap-3 sm:col-span-2">
          <button
            disabled={save.isPending}
            className="rounded-xl bg-[#17665c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#105348] disabled:opacity-60"
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
