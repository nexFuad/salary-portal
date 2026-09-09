"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Download,
  Eye,
  FileText,
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
import { officerRequestsService } from "@/Services/officer-requests.services";
import type { OfficerDocument } from "@/Types/officer-requests";
import { uploadDocument } from "@/Services/upload.services";
import { SimpleTable, StatusBadge, TableCell, TableRow } from "../Shared";

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
  const [page, setPage] = useState(1);
  const [view, setView] = useState<OfficerDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    documentType: documentTypes[0],
    description: "",
  });
  const documentsQuery = useQuery({
    queryKey: ["officer-documents"],
    queryFn: officerRequestsService.documents,
  });
  const documents = documentsQuery.data ?? [];
  const { query, setQuery, filteredData } = useSearchBar({
    data: documents,
    searchFields: [
      "title",
      "documentType",
      "fileName",
      (document) => document.user.name,
      (document) => document.user.employeeId,
    ],
  });
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a file.");
      const fileUrl = await uploadDocument(file);
      return officerRequestsService.createDocument({
        ...form,
        fileUrl,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });
    },
    onSuccess: () => {
      setIsUploadOpen(false);
      setFile(null);
      setForm({ title: "", documentType: documentTypes[0], description: "" });
      queryClient.invalidateQueries({ queryKey: ["officer-documents"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: officerRequestsService.deleteDocument,
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
    }) => officerRequestsService.setDocumentStatus(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["officer-documents"] }),
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filteredData.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7edec] bg-white px-4 py-4 sm:px-5">
        <label className="flex h-10 min-w-[220px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
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
        {rows.map((document) => (
          <TableRow key={document.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {document.user.profilePic ? (
                  <img
                    src={document.user.profilePic}
                    alt=""
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
        totalItems={filteredData.length}
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
            <img
              src={view.fileUrl}
              alt={view.title}
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
              uploadMutation.mutate();
            }}
            className="space-y-3"
          >
            <input
              required
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder="Document title"
              className="h-11 w-full rounded-lg border px-3"
            />
            <ShadcnSelect
              value={form.documentType}
              onValueChange={(documentType) =>
                setForm({ ...form, documentType })
              }
              options={documentTypes.map((value) => ({ label: value, value }))}
            />
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Description (optional)"
              className="w-full rounded-lg border p-3"
            />
            <input
              required
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <button
              disabled={uploadMutation.isPending}
              className="w-full rounded-lg bg-[#1d625b] py-3 font-semibold text-white disabled:opacity-50"
            >
              {uploadMutation.isPending ? "Uploading…" : "Upload document"}
            </button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
