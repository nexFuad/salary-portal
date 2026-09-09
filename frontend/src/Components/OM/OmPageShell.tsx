import type { ReactNode } from "react";

type OmPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
};

export default function OmPageShell({
  title,
  subtitle,
  children,
  action,
}: OmPageShellProps) {
  return (
    <main className="w-full px-3 py-6 sm:px-5 sm:py-8 lg:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-[#438178]">OM portal</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </main>
  );
}
