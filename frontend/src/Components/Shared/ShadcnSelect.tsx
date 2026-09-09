"use client";

import { useSyncExternalStore } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export type ShadcnSelectOption = {
  label: string;
  value: string;
};

type ShadcnSelectProps = {
  value?: string;
  onValueChange: (value: string) => void;
  options: ShadcnSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const subscribe = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export default function ShadcnSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className = "",
}: ShadcnSelectProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );

  // Render the same native control on the server and the browser's first pass.
  // Radix mounts only after hydration, preventing server/client markup drift.
  if (!mounted) {
    return (
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
        className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#17665c] focus:ring-2 focus:ring-[#17665c]/10 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        {!value ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <SelectPrimitive.Root
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={`flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-800 outline-none transition focus:border-[#17665c] focus:ring-2 focus:ring-[#17665c]/10 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-slate-500" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-[70] max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-3 pr-8 text-sm text-slate-700 outline-none data-[highlighted]:bg-[#e8f0ef] data-[highlighted]:text-[#17665c]"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex items-center text-[#17665c]">
                  <Check className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
