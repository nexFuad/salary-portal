"use client";

import {
  FileText,
  Trash2,
  Upload,
  Eye,
  Search,
  LoaderCircle,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import OmPageShell from "@/Components/OM/OmPageShell";
import Modal from "@/Components/Shared/Modal";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import ShadcnSelect from "@/Components/Shared/ShadcnSelect";
import { useInfiniteScroll } from "@/Hooks/useInfiniteScroll";
import { useSearchBar } from "@/Hooks/useSearchBar";
import { documentService } from "@/Services/document.services";
import type { UserDocument } from "@/Types/om";

const documentTypes = [
  "Resume/CV",
  "National ID",
  "Passport",
  "Educational Certificate",
  "Employment Document",
  "Contract",
  "Bank Document",
  "Other",
];
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<UserDocument | null>(
    null,
  );
  const [documentToDelete, setDocumentToDelete] = useState<UserDocument | null>(
    null,
  );
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    documentType: "Resume/CV",
    description: "",
  });
  const documentsQuery = useQuery({
    queryKey: ["documents", searchQuery],
    queryFn: () => documentService.list({ search: searchQuery || undefined }),
  });
  const documents = documentsQuery.data ?? [];
  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll(documents);
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a document to upload.");
      return documentService.upload(form, file);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      setOpen(false);
      setFile(null);
      setForm({ title: "", documentType: "Resume/CV", description: "" });
    },
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "Upload failed."),
  });
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
          onClick={() => {
            setMessage("");
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#17665c] px-3.5 py-2.5 text-sm font-semibold text-white"
        >
          <Upload className="size-4" />
          Upload document
        </button>
      }
    >
      <label className="mb-4 flex h-10 max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-white px-3"><Search className="size-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search documents" className="min-w-0 flex-1 text-sm outline-none" /></label>
      {documentsQuery.isPending || documentsQuery.isError ? (
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
            {visibleItems.map((document) => (
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
          {hasMore ? <div ref={sentinelRef} className="py-8 text-center text-sm font-medium text-slate-400">Loading more documents…</div> : null}
        </>
      )}
      {open && (
        <Modal
          title="Upload document"
          onClose={() => !uploadMutation.isPending && setOpen(false)}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("");
              uploadMutation.mutate();
            }}
            className="grid gap-4"
          >
            <label className="text-sm font-medium text-slate-700">
              Document title
              <input
                required
                value={form.title}
                disabled={uploadMutation.isPending}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="e.g. Employment contract"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Document type
              <ShadcnSelect
                value={form.documentType}
                disabled={uploadMutation.isPending}
                onValueChange={(documentType) =>
                  setForm({ ...form, documentType })
                }
                className="mt-1.5"
                options={documentTypes.map((value) => ({
                  label: value,
                  value,
                }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Description{" "}
              <span className="font-normal text-slate-400">(optional)</span>
              <textarea
                value={form.description}
                disabled={uploadMutation.isPending}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className="mt-1.5 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm"
                placeholder="Add a short note"
              />
            </label>
            <div>
              <p className="text-sm font-medium text-slate-700">File</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/jpeg,image/png"
                className="hidden"
                disabled={uploadMutation.isPending}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                disabled={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#78aaa2] bg-[#eff7f5] px-4 py-5 text-sm font-semibold text-[#17665c] disabled:opacity-60"
              >
                <Upload className="size-4" />
                {file ? file.name : "Choose PDF, JPG, or PNG file"}
              </button>
              <p className="mt-1 text-xs text-slate-400">
                Maximum file size: 10 MB
              </p>
            </div>
            {message && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {message}
              </p>
            )}
            <button
              disabled={uploadMutation.isPending}
              className="rounded-xl bg-[#17665c] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {uploadMutation.isPending && (
                <LoaderCircle className="mr-2 inline size-4 animate-spin" />
              )}
              {uploadMutation.isPending
                ? "File uploading, please wait…"
                : "Upload document"}
            </button>
          </form>
        </Modal>
      )}
      {previewDocument && (
        <Modal
          title={previewDocument.title}
          onClose={() => setPreviewDocument(null)}
        >
          <div className="min-h-[55dvh] overflow-hidden rounded-xl bg-slate-100">
            {previewDocument.mimeType === "application/pdf" ? (
              <iframe
                title={previewDocument.title}
                src={previewDocument.fileUrl}
                className="h-[55dvh] w-full border-0"
              />
            ) : (
              <Image
                src={previewDocument.fileUrl}
                alt={previewDocument.title}
                width={1000}
                height={700}
                unoptimized
                className="max-h-[55dvh] w-full object-contain"
              />
            )}
          </div>
          <a
            href={previewDocument.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#17665c] hover:underline"
          >
            <ExternalLink className="size-4" />
            Open original file
          </a>
        </Modal>
      )}
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
