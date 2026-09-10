"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import OmPageShell from "@/Components/OM/OmPageShell";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import Modal from "@/Components/Shared/Modal";
import ShadcnSelect from "@/Components/Shared/ShadcnSelect";
import { useInfiniteScroll } from "@/Hooks/useInfiniteScroll";
import { loanService } from "@/Services/om.services";
import type { Loan } from "@/Types/om";
type Form = {
  loanType: string;
  requestedAmount: string;
  purpose: string;
  monthlyInstallment: string;
  preferredStartDate: string;
  note: string;
  requestDate: string;
};
const fresh = (): Form => ({
  loanType: "Personal Loan",
  requestedAmount: "",
  purpose: "",
  monthlyInstallment: "",
  preferredStartDate: new Date().toISOString().slice(0, 10),
  note: "",
  requestDate: new Date().toISOString().slice(0, 10),
});
const money = (v: string | null) =>
  v ? `৳${Number(v).toLocaleString()}` : "—";
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
const statusLabel = (status: Loan["status"]) =>
  status === "COMPLETED" ? "Closed" : status[0] + status.slice(1).toLowerCase();
const statusClass = (status: Loan["status"]) =>
  ({
    PENDING: "bg-amber-50 text-amber-700",
    APPROVED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-rose-50 text-rose-700",
    CANCELLED: "bg-slate-100 text-slate-600",
    COMPLETED: "bg-sky-50 text-sky-700",
    ACTIVE: "bg-sky-50 text-sky-700",
  })[status];

export default function OmLoansPage() {
  const client = useQueryClient();
  const [form, setForm] = useState<Form>(fresh());
  const [editing, setEditing] = useState<Loan | null>(null);
  const [deleting, setDeleting] = useState<Loan | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const query = useQuery({ queryKey: ["loans"], queryFn: loanService.list });
  const records = query.data ?? [];
  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll(records);
  const save = useMutation({
    mutationFn: () =>
      editing ? loanService.update(editing.id, form) : loanService.create(form),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["loans"] });
      setOpen(false);
      setEditing(null);
      setForm(fresh());
    },
    onError: () => setError("Could not save loan request."),
  });
  const remove = useMutation({
    mutationFn: loanService.remove,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["loans"] });
      setDeleting(null);
    },
  });
  const edit = (r: Loan) => {
    setEditing(r);
    setForm({
      loanType: r.loanType,
      requestedAmount: r.requestedAmount,
      purpose: r.purpose,
      monthlyInstallment: r.monthlyInstallment,
      preferredStartDate: r.preferredStartDate.slice(0, 10),
      note: r.note ?? "",
      requestDate: r.requestDate.slice(0, 10),
    });
    setOpen(true);
  };
  return (
    <OmPageShell
      title="Loans"
      subtitle="Submit and track your employee loan requests."
      action={
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setForm(fresh());
            setError("");
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#17665c] px-3.5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="size-4" />
          Request loan
        </button>
      }
    >
      {query.isPending || query.isError ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
          No loan requests found.
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {visibleItems.map((request) => {
              const isPending = request.status === "PENDING";
              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">{request.loanType}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(request.status)}`}
                    >
                      {statusLabel(request.status)}
                    </span>
                  </div>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="grid grid-cols-3 gap-3">
                      <div><p className="text-xs text-slate-400">Requested amount</p><p className="mt-1 font-semibold text-slate-700">{money(request.requestedAmount)}</p></div>
                      <div><p className="text-xs text-slate-400">Repayment</p><p className="mt-1 font-semibold text-slate-700">{request.repaymentMonths} months</p></div>
                      <div><p className="text-xs text-slate-400">Remaining</p><p className="mt-1 font-semibold text-slate-700">{money(request.remainingAmount)}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                      <div><p className="text-xs font-medium text-slate-400">Purpose</p><p className="mt-0.5 line-clamp-1 text-slate-700">{request.purpose}</p></div>
                      <div><p className="text-xs font-medium text-slate-400">Note</p><p className="mt-0.5 line-clamp-1 text-slate-600">{request.note || "—"}</p></div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-400">Requested {formattedDate(request.requestDate)}</p>
                    {isPending ? (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => edit(request)} aria-label="Edit loan request" title="Edit" className="grid size-8 place-items-center rounded-lg text-[#17665c] transition hover:bg-[#edf6f4]"><Pencil className="size-4" /></button>
                        <button type="button" onClick={() => setDeleting(request)} aria-label="Delete loan request" title="Delete" className="grid size-8 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"><Trash2 className="size-4" /></button>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
          {hasMore ? <div ref={sentinelRef} className="py-8 text-center text-sm font-medium text-slate-400">Loading more loan requests…</div> : null}
        </>
      )}
      {open && (
        <Modal
          title={editing ? "Edit loan request" : "Request loan"}
          onClose={() => !save.isPending && setOpen(false)}
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
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete loan request?"
          message="Only pending loan requests can be deleted."
          isPending={remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => remove.mutate(deleting.id)}
        />
      )}
    </OmPageShell>
  );
}
