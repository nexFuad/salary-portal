"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { employeeService } from "@/Services/employee.services";
import { uploadProfilePhoto } from "@/Services/upload.services";
import ShadcnSelect from "@/Components/Shared/ShadcnSelect";
import TableSkeleton from "@/Components/Shared/TableSkeleton";
import type { EmployeeInput, EmployeeRecord } from "@/Types/employee";

const emptyForm: EmployeeInput = {
  name: "",
  email: "",
  password: "",
  phone: "",
  profilePic: "",
  dateOfBirth: "",
  gender: "",
  role: "OM",
  accountStatus: "Active",
  employeeId: "",
  department: "",
  designation: "",
  employmentType: "Full Time",
  workDaysPerWeek: "5",
  workStartTime: "09:00",
  workEndTime: "15:00",
  joinDate: "",
  employmentStatus: "Active",
  basicSalary: "",
  salaryType: "Monthly",
  allowances: "",
  attendanceBonusThreshold: "",
  attendanceBonusRate: "5",
  effectiveSalaryDate: "",
  address: "",
  city: "",
  country: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  manager: "",
  workLocation: "Office",
};

function dateValue(value: string | null) {
  return value?.slice(0, 10) ?? "";
}

function toForm(employee: EmployeeRecord): EmployeeInput {
  return {
    ...emptyForm,
    name: employee.name ?? "",
    email: employee.email ?? "",
    phone: employee.phone ?? "",
    profilePic: employee.profilePic ?? "",
    gender: employee.gender ?? "",
    role: employee.role,
    accountStatus: employee.accountStatus ?? "Active",
    employeeId: employee.employeeId,
    department: employee.department ?? "",
    designation: employee.designation ?? "",
    employmentType: employee.employmentType ?? "Full Time",
    workDaysPerWeek: employee.workDaysPerWeek?.toString() ?? "5",
    workStartTime: employee.workStartTime ?? "09:00",
    workEndTime: employee.workEndTime ?? "15:00",
    employmentStatus: employee.employmentStatus ?? "Active",
    salaryType: employee.salaryType ?? "Monthly",
    address: employee.address ?? "",
    city: employee.city ?? "",
    country: employee.country ?? "",
    emergencyContactName: employee.emergencyContactName ?? "",
    emergencyContactPhone: employee.emergencyContactPhone ?? "",
    manager: employee.manager ?? "",
    workLocation: employee.workLocation ?? "Office",
    password: "",
    dateOfBirth: dateValue(employee.dateOfBirth),
    joinDate: dateValue(employee.joinDate),
    effectiveSalaryDate: dateValue(employee.effectiveSalaryDate),
    basicSalary: employee.basicSalary ?? "",
    allowances: employee.allowances ?? "",
    attendanceBonusThreshold: employee.attendanceBonusThreshold ?? "",
    attendanceBonusRate: employee.attendanceBonusRate ?? "5",
  };
}

const textInput =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#17665c] focus:ring-2 focus:ring-[#17665c]/10";

export default function NewEmployeePage({
  employeeId,
}: {
  employeeId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = Boolean(employeeId);
  const [form, setForm] = useState<EmployeeInput>(emptyForm);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const employeeQuery = useQuery({
    queryKey: ["officer-employee", employeeId],
    queryFn: () => employeeService.getById(employeeId!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (!employeeQuery.data) return;
    const timer = window.setTimeout(
      () => setForm(toForm(employeeQuery.data)),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [employeeQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload: EmployeeInput) =>
      isEditing
        ? employeeService.update(employeeId!, payload)
        : employeeService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["officer-employees"] });
      router.push("/Officer/employees");
    },
    onError: (requestError) => {
      setError(
        axios.isAxiosError(requestError)
          ? (requestError.response?.data?.message ??
              "Could not save the employee.")
          : "Could not save the employee.",
      );
    },
  });

  function update<Key extends keyof EmployeeInput>(
    key: Key,
    value: EmployeeInput[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handlePhoto(file?: File) {
    if (!file) return;
    try {
      setIsUploading(true);
      setError("");
      update("profilePic", await uploadProfilePhoto(file));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Photo upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!isEditing && form.password !== confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }
    if (isEditing && form.password && form.password !== confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }
    saveMutation.mutate(form);
  }

  if (isEditing && (employeeQuery.isPending || employeeQuery.isError))
    return <TableSkeleton rows={6} />;

  return (
    <section className="min-w-0 bg-[#f7f9f9] px-4 py-6 sm:px-6 lg:px-9">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">
              SalaryFlow <span className="mx-2">›</span> Employees
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800">
              {isEditing ? "Update employee" : "Add employee"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create and maintain secure employee records.
            </p>
          </div>
          <Link
            href="/Officer/employees"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" /> Back to employees
          </Link>
        </div>

        <form
          onSubmit={submit}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
            <label className="relative grid size-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-[#e8f0ef] text-[#17665c] ring-2 ring-white shadow-sm">
              {form.profilePic ? (
                <Image
                  src={form.profilePic}
                  alt="Employee profile"
                  width={80}
                  height={80}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <Camera className="size-7" />
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => void handlePhoto(event.target.files?.[0])}
              />
            </label>
            <div>
              <p className="font-semibold text-slate-800">Profile photo</p>
              <p className="mt-1 text-sm text-slate-500">
                {isUploading
                  ? "Uploading image…"
                  : "Optional. JPG, PNG, or WebP up to 5 MB."}
              </p>
            </div>
          </div>

          <FormSection title="Personal information">
            <Field label="Full name" required>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={textInput}
                placeholder="e.g. Rahim Ahmed"
              />
            </Field>
            <Field label="Email" required>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={textInput}
                placeholder="name@company.com"
              />
            </Field>
            <Field label="Gender">
              <ShadcnSelect
                value={form.gender}
                onValueChange={(value) => update("gender", value)}
                placeholder="Select gender"
                options={[
                  { label: "Female", value: "Female" },
                  { label: "Male", value: "Male" },
                  { label: "Non-binary", value: "Non-binary" },
                  { label: "Prefer not to say", value: "Prefer not to say" },
                ]}
              />
            </Field>
          </FormSection>

          <FormSection title="Account information">
            <Field label="Role" required>
              <ShadcnSelect
                value={form.role}
                onValueChange={(value) =>
                  update("role", value as EmployeeInput["role"])
                }
                options={[
                  { label: "OM", value: "OM" },
                  { label: "Officer", value: "OFFICER" },
                ]}
              />
            </Field>
            <Field label="Account status">
              <ShadcnSelect
                value={form.accountStatus}
                onValueChange={(value) => update("accountStatus", value)}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                  { label: "Suspended", value: "Suspended" },
                  { label: "Resigned", value: "Resigned" },
                ]}
              />
            </Field>
            <Field
              label={isEditing ? "New password" : "Password"}
              required={!isEditing}
            >
              <input
                required={!isEditing}
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className={textInput}
                placeholder="Enter a secure password"
              />
            </Field>
            <Field label="Confirm password" required={!isEditing}>
              <input
                required={!isEditing}
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={textInput}
                placeholder="Re-enter the password"
              />
            </Field>
          </FormSection>

          <FormSection title="Employment information">
            <Field label="Employee ID" required>
              <input
                required
                value={form.employeeId}
                onChange={(e) => update("employeeId", e.target.value)}
                placeholder="EMP-001"
                className={textInput}
              />
            </Field>
            <Field label="Department">
              <ShadcnSelect
                value={form.department}
                onValueChange={(value) => update("department", value)}
                placeholder="Select department"
                options={[
                  "Engineering",
                  "Human Resources",
                  "Finance",
                  "Marketing",
                  "Operations",
                  "Sales",
                  "Customer Support",
                  "Design",
                ].map((value) => ({ label: value, value }))}
              />
            </Field>
            <Field label="Designation / job title">
              <input
                value={form.designation}
                onChange={(e) => update("designation", e.target.value)}
                placeholder="Junior Developer"
                className={textInput}
              />
            </Field>
            <Field label="Employment type">
              <ShadcnSelect
                value={form.employmentType}
                onValueChange={(value) => update("employmentType", value)}
                options={["Full Time", "Part Time", "Contract", "Intern"].map(
                  (value) => ({ label: value, value }),
                )}
              />
            </Field>
            <Field label="Work days per week">
              <ShadcnSelect
                value={form.workDaysPerWeek}
                onValueChange={(value) => update("workDaysPerWeek", value)}
                options={Array.from({ length: 7 }, (_, index) => {
                  const value = String(index + 1);
                  return {
                    label: `${value} day${index ? "s" : ""} per week`,
                    value,
                  };
                })}
              />
            </Field>
            <Field label="Join date">
              <input
                type="date"
                value={form.joinDate}
                onChange={(e) => update("joinDate", e.target.value)}
                className={textInput}
              />
            </Field>
            <Field label="Employment status">
              <ShadcnSelect
                value={form.employmentStatus}
                onValueChange={(value) => update("employmentStatus", value)}
                options={["Active", "On Leave", "Resigned", "Terminated"].map(
                  (value) => ({ label: value, value }),
                )}
              />
            </Field>
            <Field label="Manager / supervisor">
              <ShadcnSelect
                value={form.manager}
                onValueChange={(value) => update("manager", value)}
                placeholder="Select reporting level"
                options={[
                  "Manager",
                  "Supervisor",
                  "Team Lead",
                  "Individual Contributor",
                  "Not assigned",
                ].map((value) => ({ label: value, value }))}
              />
            </Field>
            <Field label="Work location">
              <ShadcnSelect
                value={form.workLocation}
                onValueChange={(value) => update("workLocation", value)}
                options={["Office", "Remote", "Hybrid"].map((value) => ({
                  label: value,
                  value,
                }))}
              />
            </Field>
          </FormSection>

          <FormSection title="Salary information">
            <Field label="Basic salary">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.basicSalary}
                onChange={(e) => update("basicSalary", e.target.value)}
                className={textInput}
                placeholder="e.g. 50000"
              />
            </Field>
            <Field label="Salary type">
              <ShadcnSelect
                value={form.salaryType}
                onValueChange={(value) => update("salaryType", value)}
                options={["Monthly", "Hourly"].map((value) => ({
                  label: value,
                  value,
                }))}
              />
            </Field>
            <Field label="Allowances (attendance threshold %)">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.attendanceBonusThreshold}
                onChange={(e) =>
                  update("attendanceBonusThreshold", e.target.value)
                }
                className={textInput}
                placeholder="e.g. 90"
              />
              <p className="mt-1 text-xs font-normal text-slate-500">
                Employee qualifies for the allowance/bonus at this attendance
                percentage.
              </p>
            </Field>
            <Field label="Attendance bonus rate (%)">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.attendanceBonusRate}
                onChange={(e) => update("attendanceBonusRate", e.target.value)}
                className={textInput}
                placeholder="e.g. 5"
              />
              <p className="mt-1 text-xs font-normal text-slate-500">
                Percentage added to basic salary when the attendance target is
                met.
              </p>
            </Field>
            <Field label="Effective salary date">
              <input
                type="date"
                value={form.effectiveSalaryDate}
                onChange={(e) => update("effectiveSalaryDate", e.target.value)}
                className={textInput}
                placeholder="House, road, area"
              />
            </Field>
          </FormSection>

          <FormSection title="Contact and address">
            <Field label="Phone number">
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={textInput}
                placeholder="e.g. Dhaka"
              />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <input
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className={textInput}
                placeholder="e.g. Bangladesh"
              />
            </Field>
            <Field label="City">
              <input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={textInput}
                placeholder="01XXXXXXXXX"
              />
            </Field>
            <Field label="Country">
              <input
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className={textInput}
                placeholder="e.g. Bangladesh"
              />
            </Field>
            <Field label="Emergency contact phone">
              <input
                value={form.emergencyContactPhone}
                onChange={(e) =>
                  update("emergencyContactPhone", e.target.value)
                }
                className={textInput}
                placeholder="e.g. +880 1700 000000"
              />
            </Field>
          </FormSection>

          {error ? (
            <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <button
              disabled={isUploading || saveMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#17665c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#105348] disabled:opacity-60"
            >
              <Save className="size-4" />
              {saveMutation.isPending
                ? "Saving…"
                : isEditing
                  ? "Update employee"
                  : "Create employee"}
            </button>
            <Link
              href="/Officer/employees"
              className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="mt-7">
      <legend className="text-base font-bold text-slate-800">{title}</legend>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  children,
  required,
  className = "",
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`text-sm font-medium text-slate-700 ${className}`}>
      {label}
      {required ? <span className="ml-1 text-rose-500">*</span> : null}
      {children}
    </label>
  );
}
