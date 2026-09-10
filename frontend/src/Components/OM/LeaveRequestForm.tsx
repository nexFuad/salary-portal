"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import OmPageShell from "./OmPageShell";
import ShadcnSelect from "@/Components/Shared/ShadcnSelect";
import { leaveRequestService } from "@/Services/leave-request.services";
import type { LeaveRequest, LeaveRequestInput } from "@/Types/leave-request";

type LeaveRequestFormProps = {
  requestId?: string;
  modal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
};

const emptyForm: LeaveRequestInput = {
  leaveType: "Annual leave",
  reason: "",
  startDate: "",
  endDate: "",
  note: "",
};

function toDateInput(value: string) {
  return value.slice(0, 10);
}

function toFormValues(request: LeaveRequest): LeaveRequestInput {
  return {
    leaveType: request.leaveType,
    reason: request.reason,
    note: request.note ?? "",
    startDate: toDateInput(request.startDate),
    endDate: toDateInput(request.endDate),
  };
}

export default function LeaveRequestForm({
  requestId,
  modal = false,
  onClose,
  onSuccess,
}: LeaveRequestFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LeaveRequestInput | null>(
    requestId ? null : emptyForm,
  );
  const [error, setError] = useState("");
  const requestQuery = useQuery({
    queryKey: ["leave-requests", requestId],
    queryFn: () => leaveRequestService.getById(requestId!),
    enabled: Boolean(requestId),
  });

  const activeForm =
    form ?? (requestQuery.data ? toFormValues(requestQuery.data) : emptyForm);

  const saveMutation = useMutation({
    mutationFn: (input: LeaveRequestInput) =>
      requestId
        ? leaveRequestService.update(requestId, input)
        : leaveRequestService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      if (onSuccess) {
        onSuccess();
        return;
      }
      router.push("/OM/leave-request");
    },
    onError: (mutationError) => {
      const message = axios.isAxiosError(mutationError)
        ? (mutationError.response?.data?.message ??
          "Could not save your leave request.")
        : mutationError instanceof Error
          ? mutationError.message
          : "Could not save your leave request.";
      setError(message);
    },
  });

  function updateField<Key extends keyof LeaveRequestInput>(
    key: Key,
    value: LeaveRequestInput[Key],
  ) {
    setForm((current) => ({ ...(current ?? activeForm), [key]: value }));
  }

  const formContent = (
    <>
      {requestId && (requestQuery.isPending || requestQuery.isError) ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ) : (
        <form
          className={
            modal
              ? ""
              : "max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          }
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            saveMutation.mutate(activeForm);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Leave type
              <ShadcnSelect
                value={activeForm.leaveType}
                onValueChange={(leaveType) =>
                  updateField("leaveType", leaveType)
                }
                className="mt-1.5"
                options={[
                  "Annual leave",
                  "Sick leave",
                  "Medical leave",
                  "Marriage leave",
                  "Maternity leave",
                  "Paternity leave",
                  "Bereavement leave",
                  "Unpaid leave",
                ].map((value) => ({ label: value, value }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Reason
              <input
                required
                value={activeForm.reason}
                onChange={(event) => updateField("reason", event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#2c7469]"
                placeholder="Short reason"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              From
              <input
                required
                type="date"
                value={activeForm.startDate}
                onChange={(event) =>
                  updateField("startDate", event.target.value)
                }
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#2c7469]"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              To
              <input
                required
                type="date"
                value={activeForm.endDate}
                onChange={(event) => updateField("endDate", event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#2c7469]"
              />
            </label>
          </div>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Note
            <textarea
              className="mt-1.5 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#2c7469]"
              placeholder="Add any details for your manager"
              value={activeForm.note}
              onChange={(event) => updateField("note", event.target.value)}
            />
          </label>
          {error && (
            <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          <div className="mt-5 flex items-center gap-3">
            <button
              className="rounded-xl bg-[#17665c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#105348] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending
                ? "Saving…"
                : requestId
                  ? "Update request"
                  : "Submit request"}
            </button>
            {modal && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </>
  );

  if (modal) return formContent;

  return (
    <OmPageShell
      title={requestId ? "Edit leave request" : "New leave request"}
      subtitle={
        requestId
          ? "Update your pending request before it is reviewed."
          : "Submit a leave request for your manager to review."
      }
      action={
        <Link
          href="/OM/leave-request"
          className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-[#17665c]"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>
      }
    >
      {formContent}
    </OmPageShell>
  );
}
