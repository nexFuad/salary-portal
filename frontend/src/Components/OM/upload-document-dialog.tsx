"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Upload } from "lucide-react";
import Modal from "@/Components/Shared/Modal";
import ShadcnSelect from "@/Components/Shared/ShadcnSelect";
import { documentService } from "@/Services/document.services";

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

export default function UploadDocumentDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    documentType: "Resume/CV",
    description: "",
  });
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a document to upload.");
      return documentService.upload(form, file);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      onClose();
    },
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "Upload failed."),
  });

  return (
    <Modal
      title="Upload document"
      onClose={() => !uploadMutation.isPending && onClose()}
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
  );
}
