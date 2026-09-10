"use client";

import Image from "next/image";
import { Camera, LoaderCircle, Save, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import OmPageShell from "@/Components/OM/OmPageShell";
import { useAuth } from "@/Hooks/useAuth";
import { profileService } from "@/Services/om.services";
import { uploadProfilePhoto } from "@/Services/upload.services";

const display = (value: string | null | undefined) => value?.trim() || "—";
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";

function AccountSkeleton() {
  return (
    <div className="grid animate-pulse gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mx-auto size-28 rounded-full bg-slate-200" />
        <div className="mx-auto mt-5 h-5 w-32 rounded bg-slate-200" />
        <div className="mx-auto mt-2 h-4 w-24 rounded bg-slate-100" />
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="mt-5 h-4 rounded bg-slate-100" />
        ))}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-72 rounded bg-slate-100" />
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="mt-6 h-11 w-32 rounded-xl bg-slate-200" />
      </section>
    </div>
  );
}

export default function MyAccount() {
  const { user, refreshUser, isLoading } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
      setPreview(user.profilePic);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);
  const save = useMutation({
    mutationFn: async () =>
      profileService.update({
        name: name.trim(),
        phone: phone.trim(),
        profilePic: file ? await uploadProfilePhoto(file) : (preview ?? ""),
      }),
    onSuccess: async () => {
      await refreshUser();
      setFile(null);
      setMessage("Profile updated successfully.");
    },
    onError: (error) =>
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update your profile.",
      ),
  });
  if (!user)
    return (
      <OmPageShell title="My account" subtitle="Your profile information.">
        {isLoading ? (
          <AccountSkeleton />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Account information is unavailable.
          </div>
        )}
      </OmPageShell>
    );
  const information = [
    ["Full name", user.name],
    ["Email", user.email],
    ["Phone", user.phone],
    ["Employee ID", user.employeeId],
    ["Company", user.company],
    ["Role", user.role],
    ["Last login", date(user.lastLogin)],
    ["Member since", date(user.createdAt)],
  ];
  return (
    <OmPageShell
      title="My account"
      subtitle="Manage your personal profile and account details."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col items-center text-center">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="group relative grid size-28 place-items-center overflow-hidden rounded-full border-4 border-[#e8f2f0] bg-slate-100"
              aria-label="Choose profile image"
            >
              {preview ? (
                <Image
                  src={preview}
                  alt="Profile preview"
                  width={112}
                  height={112}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <UserRound className="size-10 text-slate-400" />
              )}
              <span className="absolute inset-0 grid place-items-center bg-slate-950/45 text-white opacity-0 transition group-hover:opacity-100">
                <Camera className="size-6" />
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const next = e.target.files?.[0] ?? null;
                if (!next) return;
                if (
                  !next.type.startsWith("image/") ||
                  next.size > 5 * 1024 * 1024
                ) {
                  setMessage("Choose an image file up to 5 MB.");
                  return;
                }
                setFile(next);
                setPreview(URL.createObjectURL(next));
                setMessage("");
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 text-sm font-semibold text-[#17665c] hover:underline"
            >
              Change profile photo
            </button>
            <p className="mt-1 text-xs text-slate-400">
              JPG, PNG or WEBP · Max 5 MB
            </p>
            <h2 className="mt-5 text-xl font-bold text-slate-800">
              {display(user.name)}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {display(user.employeeId)} · {display(user.role)}
            </p>
          </div>
          <dl className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
            {information.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 py-3"
              >
                <dt className="text-sm text-slate-500">{label}</dt>
                <dd className="max-w-[58%] truncate text-right text-sm font-medium text-slate-700">
                  {display(value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setMessage("");
            save.mutate();
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-800">Personal information</h2>
            <p className="mt-1 text-sm text-slate-500">
              Only your name, phone number and profile image can be updated.
            </p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Full name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#2c7469]"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Phone number
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="—"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#2c7469]"
              />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Email address
              <input
                readOnly
                value={user.email ?? "—"}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
              />
            </label>
          </div>
          {message && (
            <p
              className={`mt-4 rounded-xl px-3 py-2 text-sm ${message.includes("success") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
            >
              {message}
            </p>
          )}
          <button
            disabled={save.isPending}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#17665c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#105348] disabled:opacity-60"
          >
            {save.isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {save.isPending ? "Saving profile…" : "Save changes"}
          </button>
        </form>
      </div>
    </OmPageShell>
  );
}
