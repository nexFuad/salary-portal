"use client";

import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ActionMenuItem = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
};
type ActionMenuProps = { items: ActionMenuItem[] };

export default function ActionMenu({ items }: ActionMenuProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function toggle() {
    if (buttonRef.current)
      setOpenUp(
        window.innerHeight - buttonRef.current.getBoundingClientRect().bottom <
          150,
      );
    setOpen((value) => !value);
  }

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label="Open actions"
        aria-expanded={open}
        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <MoreHorizontal className="size-5" />
      </button>
      {open && (
        <div
          className={`absolute right-0 z-30 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ${openUp ? "bottom-full mb-1.5" : "top-full mt-1.5"}`}
        >
          {items.map(({ label, icon: Icon, onClick, danger }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setOpen(false);
                onClick();
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
