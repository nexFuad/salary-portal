"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import OmPageShell from "@/Components/OM/OmPageShell";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import Modal from "@/Components/Shared/Modal";
import { useInfiniteScroll } from "@/Hooks/useInfiniteScroll";
import { salaryAdvanceService } from "@/Services/om.services";
import type { SalaryAdvance } from "@/Types/om";

type Form = {
  requestedAmount: string;
  repaymentMonths: string;
  reason: string;
  note: string;
  requestDate: string;
};
const initialForm = (): Form => ({
  requestedAmount: "",
  repaymentMonths: "",
  reason: "",
  note: "",
  requestDate: new Date().toISOString().slice(0, 10),
});
const amount = (value: string | null) =>
  value ? `৳${Number(value).toLocaleString()}` : "—";
const date = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
const statusClass = (status: SalaryAdvance["status"]) =>
  ({
    PENDING: "bg-amber-50 text-amber-700",
    APPROVED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-rose-50 text-rose-700",
    CANCELLED: "bg-slate-100 text-slate-600",
    COMPLETED: "bg-sky-50 text-sky-700",
    ACTIVE: "bg-sky-50 text-sky-700",
  })[status];

export default function SalaryAdvancePage() {
  const client = useQueryClient();
  const [form, setForm] = useState<Form>(initialForm());
  const [editing, setEditing] = useState<SalaryAdvance | null>(null);
  const [deleting, setDeleting] = useState<SalaryAdvance | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["salary-advances"],
    queryFn: salaryAdvanceService.list,
  });
  const records = query.data ?? [];
  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll(records);
  const save = useMutation({
    mutationFn: () =>
      editing
        ? salaryAdvanceService.update(editing.id, {
            ...form,
            repaymentMonths: Number(form.repaymentMonths),
          })
        : salaryAdvanceService.create({
            ...form,
            repaymentMonths: Number(form.repaymentMonths),
          }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["salary-advances"] });
      setOpen(false);
      setEditing(null);
      setForm(initialForm());
    },
    onError: () => setError("Could not save your salary advance request."),
  });
  const remove = useMutation({
    mutationFn: salaryAdvanceService.remove,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["salary-advances"] });
      setDeleting(null);
    },
  });
  return (
    <OmPageShell
      title="Salary advance"
      subtitle="Submit and track advances from your upcoming salary."
      action={
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setForm(initialForm());
            setError("");
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#17665c] px-3.5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="size-4" />
          Request advance
        </button>
      }
    >
      {query.isPending || query.isError ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
          No salary advance requests found.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((request) => {
              const isPending = request.status === "PENDING";
              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Requested amount
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-slate-800">
                        {amount(request.requestedAmount)}
                      </h2>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(request.status)}`}
                    >
                      {request.status[0] + request.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                      <div>
                        <p className="text-xs text-slate-400">Repayment</p>
                        <p className="mt-1 font-semibold text-slate-700">{request.repaymentMonths} months</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Remaining</p>
                        <p className="mt-1 font-semibold text-slate-700">{amount(request.approvedAmount ?? request.requestedAmount)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">Reason</p>
                      <p className="mt-0.5 line-clamp-2 text-slate-700">{request.reason}</p>
                    </div>
                    {request.note ? (
                      <div>
                        <p className="text-xs font-medium text-slate-400">Note</p>
                        <p className="mt-0.5 line-clamp-2 text-slate-600">{request.note}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-400">Requested {date(request.requestDate)}</p>
                    {isPending ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(request);
                          setForm({
                            requestedAmount: request.requestedAmount,
                            repaymentMonths: String(request.repaymentMonths),
                            reason: request.reason,
                            note: request.note ?? "",
                            requestDate: request.requestDate.slice(0, 10),
                          });
                          setError("");
                          setOpen(true);
                        }}
                        aria-label="Edit salary advance request"
                        title="Edit"
                        className="grid size-8 place-items-center rounded-lg text-[#17665c] transition hover:bg-[#edf6f4]"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(request)}
                        aria-label="Delete salary advance request"
                        title="Delete"
                        className="grid size-8 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
          {hasMore ? (
            <div
              ref={sentinelRef}
              className="py-8 text-center text-sm font-medium text-slate-400"
            >
              Loading more salary advance requests…
            </div>
          ) : null}
        </>
      )}
      {open && (
        <Modal
          title={editing ? "Edit salary advance" : "Request salary advance"}
          onClose={() => !save.isPending && setOpen(false)}
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
          title="Delete salary advance request?"
          message="This salary advance request will be permanently deleted."
          isPending={remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => remove.mutate(deleting.id)}
        />
      )}
    </OmPageShell>
  );
}
