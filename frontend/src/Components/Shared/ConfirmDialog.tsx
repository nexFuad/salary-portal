"use client";

import { AlertTriangle } from "lucide-react";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Yes, delete",
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <button
        type="button"
        aria-label="Close confirmation dialog"
        disabled={isPending}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-950/40 disabled:cursor-not-allowed"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <h2
              id="confirm-dialog-title"
              className="text-base font-bold text-slate-800"
            >
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
