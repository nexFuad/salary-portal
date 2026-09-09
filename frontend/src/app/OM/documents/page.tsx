"use client";

import {
  FileText,
  Trash2,
  Upload,
  Eye,
  LoaderCircle,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import OmPageShell from "@/Components/OM/OmPageShell";
import OmTable from "@/Components/Shared/OmTable";
import ActionMenu from "@/Components/Shared/ActionMenu";
import Modal from "@/Components/Shared/Modal";
import ConfirmDialog from "@/Components/Shared/ConfirmDialog";
import TableSkeleton from "@/Components/Shared/TableSkeleton";
import ShadcnSelect from "@/Components/Shared/ShadcnSelect";
import { type TableColumn } from "@/Components/Shared/Table";
import { documentService } from "@/Services/om.services";
import { uploadDocument } from "@/Services/upload.services";
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

export default function OmDocumentsPage() {
  const queryClient = useQueryClient();
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
    queryKey: ["documents"],
    queryFn: documentService.list,
  });
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a document to upload.");
      if (
        !["application/pdf", "image/jpeg", "image/png"].includes(file.type) ||
        file.size > 10 * 1024 * 1024
      )
        throw new Error(
          "Only PDF, JPG, and PNG files up to 10 MB are allowed.",
        );
      return documentService.create({
        ...form,
        fileUrl: await uploadDocument(file),
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });
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
  const columns: TableColumn<UserDocument>[] = [
    {
      id: "title",
      header: "Document title",
      cell: (document) => (
        <span className="font-medium text-slate-700">{document.title}</span>
      ),
    },
    { id: "type", header: "Type", cell: (document) => document.documentType },
    {
      id: "file",
      header: "File",
      cell: (document) => (
        <button
          type="button"
          onClick={() => setPreviewDocument(document)}
          className="inline-flex items-center gap-1 text-left text-[#17665c] hover:underline"
        >
          <FileText className="size-3.5" />
          {document.fileName}
        </button>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (document) => (
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          {document.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (document) => (
        <ActionMenu
          items={[
            {
              label: "View",
              icon: Eye,
              onClick: () => setPreviewDocument(document),
            },
            {
              label: "Delete",
              icon: Trash2,
              danger: true,
              onClick: () => setDocumentToDelete(document),
            },
          ]}
        />
      ),
    },
  ];
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
      {documentsQuery.isPending ? (
        <TableSkeleton />
      ) : (
        <OmTable
          columns={columns}
          data={documentsQuery.data ?? []}
          getRowId={(document) => document.id}
          emptyMessage="No documents uploaded yet."
          currentPage={1}
          totalItems={(documentsQuery.data ?? []).length}
          pageSize={50}
          onPageChange={() => {}}
        />
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
