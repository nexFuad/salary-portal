"use client";

import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import OmPageShell from "@/Components/OM/OmPageShell";
import SalaryAdvanceDialog from "@/Components/OM/salary-advance-dialog";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import LoadMoreStatus from "@/Components/Shared/LoadMoreStatus";
import DataLoadError from "@/Components/Shared/DataLoadError";
import { useLoadMoreOnScroll } from "@/Hooks/useLoadMoreOnScroll";
import { useSearchBar } from "@/Hooks/useSearchBar";
import { salaryAdvanceService } from "@/Services/om.services";
import type { SalaryAdvance } from "@/Types/om";

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
  const { query: search, setQuery: setSearch, searchQuery } = useSearchBar();
  const pageSize = 10;
  const [editing, setEditing] = useState<SalaryAdvance | null>(null);
  const [deleting, setDeleting] = useState<SalaryAdvance | null>(null);
  const [open, setOpen] = useState(false);
  const query = useInfiniteQuery({
    queryKey: ["salary-advances", searchQuery],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => salaryAdvanceService.list({ search: searchQuery || undefined, page: pageParam, pageSize }),
    getNextPageParam: (lastPage, pages) => pages.length * pageSize < lastPage.total ? pages.length + 1 : undefined,
  });
  const records = query.data?.pages.flatMap((result) => result.items) ?? [];
  const sentinelRef = useLoadMoreOnScroll(Boolean(query.hasNextPage) && !query.isFetchingNextPage && !query.isFetchNextPageError, () => { void query.fetchNextPage(); });
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
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#17665c] px-3.5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="size-4" />
          Request advance
        </button>
      }
    >
      <label className="mb-4 flex h-10 max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-white px-3"><Search className="size-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search salary advances" className="min-w-0 flex-1 text-sm outline-none" /></label>
      {query.isError && !query.data ? (
        <DataLoadError retry={() => void query.refetch()} />
      ) : query.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
          No salary advance requests found.
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {records.map((request) => {
              const isPending = request.status === "PENDING";
              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">Salary advance</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(request.status)}`}
                    >
                      {request.status[0] + request.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <div className="mt-3 space-y-3 text-sm">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-slate-400">Requested amount</p>
                        <p className="mt-1 font-semibold text-slate-800">{amount(request.requestedAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Repayment</p>
                        <p className="mt-1 font-semibold text-slate-700">{request.repaymentMonths} months</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Remaining</p>
                        <p className="mt-1 font-semibold text-slate-700">{amount(request.approvedAmount ?? request.requestedAmount)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-xs font-medium text-slate-400">Reason</p>
                        <p className="mt-0.5 line-clamp-1 text-slate-700">{request.reason}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-400">Note</p>
                        <p className="mt-0.5 line-clamp-1 text-slate-600">{request.note || "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-400">Requested {date(request.requestDate)}</p>
                    {isPending ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(request);
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
          <div ref={sentinelRef} className="min-h-6">
            <LoadMoreStatus loading={query.isFetchingNextPage} error={query.isFetchNextPageError} onRetry={() => void query.fetchNextPage()} />
          </div>
        </>
      )}
      {open && <SalaryAdvanceDialog key={editing?.id ?? "new"} editing={editing} onClose={() => { setOpen(false); setEditing(null); }} />}
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
