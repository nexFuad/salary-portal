"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/Hooks/useAuth";
import OmPageShell from "@/Components/OM/OmPageShell";
import ActionMenu from "@/Components/Shared/ActionMenu";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import Modal from "@/Components/Shared/Modal";
import OmTable from "@/Components/Shared/OmTable";
import TableSkeleton from "@/Components/Shared/TableSkeleton";
import { type TableColumn } from "@/Components/Shared/Table";
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

export default function SalaryAdvancePage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [form, setForm] = useState<Form>(initialForm());
  const [editing, setEditing] = useState<SalaryAdvance | null>(null);
  const [details, setDetails] = useState<SalaryAdvance | null>(null);
  const [deleting, setDeleting] = useState<SalaryAdvance | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["salary-advances"],
    queryFn: salaryAdvanceService.list,
  });
  const records = query.data ?? [];
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
  const columns: TableColumn<SalaryAdvance>[] = [
    {
      id: "id",
      header: "Request ID",
      cell: (r) => (
        <span className="font-mono text-xs">
          {r.id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Requested",
      cell: (r) => amount(r.requestedAmount),
    },
    { id: "reason", header: "Reason", cell: (r) => r.reason },
    {
      id: "months",
      header: "Repayment",
      cell: (r) => `${r.repaymentMonths} months`,
    },
    {
      id: "remaining",
      header: "Remaining",
      cell: (r) => amount(r.approvedAmount ?? r.requestedAmount),
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => (
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          {r.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (r) => (
        <ActionMenu
          items={[
            { label: "View details", icon: Eye, onClick: () => setDetails(r) },
            {
              label: "Delete",
              icon: Trash2,
              danger: true,
              onClick: () => setDeleting(r),
            },
          ]}
        />
      ),
    },
  ];
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
      {query.isPending ? (
        <TableSkeleton rows={8} />
      ) : (
        <OmTable
          title="Your salary advance requests"
          columns={columns}
          data={records.slice((page - 1) * 10, page * 10)}
          getRowId={(r) => r.id}
          emptyMessage="No salary advance requests found."
          currentPage={page}
          totalItems={records.length}
          pageSize={10}
          onPageChange={setPage}
        />
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
      {details && (
        <Modal title="Salary advance details" onClose={() => setDetails(null)}>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Request ID", details.id],
              ["Employee", user?.name ?? "—"],
              ["Requested", amount(details.requestedAmount)],
              [
                "Remaining",
                amount(details.approvedAmount ?? details.requestedAmount),
              ],
              ["Status", details.status],
              ["Request date", date(details.requestDate)],
              ["Reason", details.reason],
              ["Admin note", details.adminNote ?? "—"],
            ].map(([key, value]) => (
              <div key={key} className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{key}</p>
                <p className="mt-1 font-medium text-slate-800">{value}</p>
              </div>
            ))}
          </div>
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
