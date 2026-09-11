"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Download,
  Eye,
  FileText,
  LoaderCircle,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import ActionMenu from "@/Components/Shared/ActionMenu";
import Modal from "@/Components/Shared/Modal";
import ShadcnSelect from "@/Components/Shared/ShadcnSelect";
import Pagination from "@/Components/Shared/Pagination";
import { useSearchBar } from "@/Hooks/useSearchBar";
import { officerDocumentService } from "@/Services/document.services";
import type { OfficerDocument } from "@/Types/officer-requests";
import {
  RequestTableSkeleton,
  SimpleTable,
  StatusBadge,
  TableCell,
  TableRow,
} from "../Shared";

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
const pageSize = 10;

function documentStatus(status: OfficerDocument["status"]) {
  if (status === "VERIFIED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  return "Pending";
}

async function downloadFile(document: OfficerDocument) {
  try {
    const response = await fetch(document.fileUrl);
    if (!response.ok) throw new Error("Download failed");

    const objectUrl = URL.createObjectURL(await response.blob());
    const link = window.document.createElement("a");
    link.href = objectUrl;
    link.download = document.fileName || document.title;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(document.fileUrl, "_blank", "noopener,noreferrer");
  }
}

export default function DocumentsList() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<OfficerDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [form, setForm] = useState({
    title: "",
    documentType: documentTypes[0],
    description: "",
  });
  const { query, setQuery, searchQuery } = useSearchBar();
  const documentsQuery = useQuery({
    queryKey: ["officer-documents", searchQuery],
    queryFn: () =>
      officerDocumentService.list({ search: searchQuery || undefined }),
  });
  const documents = documentsQuery.data ?? [];
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a file.");
      return officerDocumentService.upload(form, file);
    },
    onSuccess: () => {
      setIsUploadOpen(false);
      setFile(null);
      setUploadError("");
      setForm({ title: "", documentType: documentTypes[0], description: "" });
      queryClient.invalidateQueries({ queryKey: ["officer-documents"] });
    },
    onError: (error) =>
      setUploadError(
        error instanceof Error ? error.message : "Document upload failed.",
      ),
  });
  const deleteMutation = useMutation({
    mutationFn: officerDocumentService.remove,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["officer-documents"] }),
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => officerDocumentService.setStatus(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["officer-documents"] }),
  });

  const totalPages = Math.max(1, Math.ceil(documents.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = documents.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7edec] bg-white px-4 py-4 sm:px-5">
        <label className="flex h-10 min-w-55 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
          <Search size={16} className="text-slate-500" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search employee or document"
            className="min-w-0 flex-1 text-sm outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1d625b] px-4 py-2 text-sm font-semibold text-white"
        >
          <Upload size={16} /> Upload document
        </button>
      </div>

      <SimpleTable
        className="min-h-[70vh]"
        headers={[
          "Employee",
          "Document title",
          "Type",
          "File",
          "Status",
          "Actions",
        ]}
      >
        {documentsQuery.isPending ? <RequestTableSkeleton columns={6} /> : rows.map((document) => (
          <TableRow key={document.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {document.user.profilePic ? (
                  <Image
                    src={document.user.profilePic}
                    alt=""
                    width={32}
                    height={32}
                    unoptimized
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-8 place-items-center rounded-full bg-[#17665c] text-xs font-semibold text-white">
                    {(document.user.name ?? document.user.employeeId)
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
                <div>
                  <p className="font-semibold text-[#3b4650]">
                    {document.user.name ?? document.user.employeeId}
                  </p>
                  <p className="text-xs text-slate-500">
                    {document.user.employeeId}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>{document.title}</TableCell>
            <TableCell>{document.documentType}</TableCell>
            <TableCell>
              <button
                type="button"
                onClick={() => setView(document)}
                className="inline-flex max-w-44 items-center gap-1 truncate text-sm font-medium text-[#17665c] hover:underline"
              >
                <FileText size={15} />
                <span className="truncate">{document.fileName}</span>
              </button>
            </TableCell>
            <TableCell>
              <StatusBadge status={documentStatus(document.status)} />
            </TableCell>
            <TableCell>
              <ActionMenu
                items={[
                  {
                    label: "View",
                    icon: Eye,
                    onClick: () => setView(document),
                  },
                  {
                    label: "Download",
                    icon: Download,
                    onClick: () => void downloadFile(document),
                  },
                  ...(document.status === "PENDING"
                    ? [
                        {
                          label: "Approve",
                          icon: Check,
                          onClick: () =>
                            statusMutation.mutate({
                              id: document.id,
                              status: "APPROVED",
                            }),
                        },
                        {
                          label: "Reject",
                          icon: X,
                          danger: true,
                          onClick: () =>
                            statusMutation.mutate({
                              id: document.id,
                              status: "REJECTED",
                            }),
                        },
                      ]
                    : []),
                  {
                    label: "Delete",
                    icon: Trash2,
                    danger: true,
                    onClick: () => deleteMutation.mutate(document.id),
                  },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </SimpleTable>

      <Pagination
        currentPage={safePage}
        totalItems={documents.length}
        pageSize={pageSize}
        onPageChange={setPage}
        className="pb-8"
      />

      {view ? (
        <Modal title={view.title} onClose={() => setView(null)}>
          {view.mimeType === "application/pdf" ? (
            <iframe
              title={view.title}
              src={view.fileUrl}
              className="h-[65vh] w-full"
            />
          ) : (
            <Image
              src={view.fileUrl}
              alt={view.title}
              width={1000}
              height={700}
              unoptimized
              className="max-h-[65vh] w-full object-contain"
            />
          )}
        </Modal>
      ) : null}

      {isUploadOpen ? (
        <Modal title="Upload document" onClose={() => setIsUploadOpen(false)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setUploadError("");
              if (!file) {
                setUploadError("Choose a document to upload.");
                return;
              }
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
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#17665c] focus:ring-2 focus:ring-[#17665c]/10"
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
                options={documentTypes.map((value) => ({ label: value, value }))}
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
                placeholder="Add a short note"
                className="mt-1.5 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-[#17665c] focus:ring-2 focus:ring-[#17665c]/10"
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
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setUploadError("");
                }}
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
            {uploadError ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {uploadError}
              </p>
            ) : null}
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
      ) : null}
    </div>
  );
}
