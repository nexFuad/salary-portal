"use client";

import {
  FileText,
  Trash2,
  Upload,
  Eye,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OmPageShell from "@/Components/OM/OmPageShell";
import UploadDocumentDialog from "@/Components/OM/upload-document-dialog";
import DocumentPreviewDialog from "@/Components/OM/document-preview-dialog";
import LoadMoreStatus from "@/Components/Shared/LoadMoreStatus";
import DataLoadError from "@/Components/Shared/DataLoadError";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import { useLoadMoreOnScroll } from "@/Hooks/useLoadMoreOnScroll";
import { useSearchBar } from "@/Hooks/useSearchBar";
import { documentService } from "@/Services/document.services";
import type { UserDocument } from "@/Types/om";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
const statusClass = (status: UserDocument["status"]) =>
  ({
    PENDING: "bg-amber-50 text-amber-700",
    VERIFIED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-rose-50 text-rose-700",
  })[status];

export default function OmDocumentsPage() {
  const queryClient = useQueryClient();
  const { query: search, setQuery: setSearch, searchQuery } = useSearchBar();
  const pageSize = 10;
  const [open, setOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<UserDocument | null>(
    null,
  );
  const [documentToDelete, setDocumentToDelete] = useState<UserDocument | null>(
    null,
  );
  const documentsQuery = useInfiniteQuery({
    queryKey: ["documents", searchQuery],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => documentService.list({ search: searchQuery || undefined, page: pageParam, pageSize }),
    getNextPageParam: (lastPage, pages) => pages.length * pageSize < lastPage.total ? pages.length + 1 : undefined,
  });
  const documents = documentsQuery.data?.pages.flatMap((result) => result.items) ?? [];
  const sentinelRef = useLoadMoreOnScroll(Boolean(documentsQuery.hasNextPage) && !documentsQuery.isFetchingNextPage && !documentsQuery.isFetchNextPageError, () => { void documentsQuery.fetchNextPage(); });
  const deleteMutation = useMutation({
    mutationFn: documentService.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDocumentToDelete(null);
    },
  });
  return (
    <OmPageShell
      title="Documents"
      subtitle="Upload and manage your employment documents."
      action={
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#17665c] px-3.5 py-2.5 text-sm font-semibold text-white"
        >
          <Upload className="size-4" />
          Upload document
        </button>
      }
    >
      <label className="mb-4 flex h-10 max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-white px-3"><Search className="size-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search documents" className="min-w-0 flex-1 text-sm outline-none" /></label>
      {documentsQuery.isError && !documentsQuery.data ? (
        <DataLoadError retry={() => void documentsQuery.refetch()} />
      ) : documentsQuery.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
          No documents uploaded yet.
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {documents.map((document) => (
              <article
                key={document.id}
                className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf6f4] text-[#17665c]">
                      <FileText className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-slate-800">
                        {document.title}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">{document.documentType}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(document.status)}`}
                  >
                    {document.status[0] + document.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-400">File</p>
                    <button
                      type="button"
                      onClick={() => setPreviewDocument(document)}
                      className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate font-medium text-[#17665c] hover:underline"
                    >
                      <FileText className="size-3.5 shrink-0" />
                      <span className="truncate">{document.fileName}</span>
                    </button>
                  </div>
                  {document.description ? (
                    <div>
                      <p className="text-xs font-medium text-slate-400">Description</p>
                      <p className="mt-1 line-clamp-1 text-slate-700">{document.description}</p>
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-400">Uploaded {formatDate(document.createdAt)}</p>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setPreviewDocument(document)} aria-label="View document" title="View" className="grid size-8 place-items-center rounded-lg text-[#17665c] transition hover:bg-[#edf6f4]"><Eye className="size-4" /></button>
                    <button type="button" onClick={() => setDocumentToDelete(document)} aria-label="Delete document" title="Delete" className="grid size-8 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div ref={sentinelRef} className="min-h-6">
            <LoadMoreStatus loading={documentsQuery.isFetchingNextPage} error={documentsQuery.isFetchNextPageError} onRetry={() => void documentsQuery.fetchNextPage()} />
          </div>
        </>
      )}
      {open && <UploadDocumentDialog onClose={() => setOpen(false)} />}
      {previewDocument && <DocumentPreviewDialog document={previewDocument} onClose={() => setPreviewDocument(null)} />}
      {documentToDelete && (
        <ConfirmDialog
          title="Delete document?"
          message={`Are you sure you want to permanently delete “${documentToDelete.title}”?`}
          isPending={deleteMutation.isPending}
          onCancel={() => setDocumentToDelete(null)}
          onConfirm={() => deleteMutation.mutate(documentToDelete.id)}
        />
      )}
    </OmPageShell>
  );
}
