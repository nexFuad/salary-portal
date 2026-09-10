import type { ReactNode } from "react";

type PersonAvatarProps = {
  initials: string;
  color?: string;
  name: string;
};

export function PersonAvatar({
  initials,
  color = "bg-[#607383]",
  name,
}: PersonAvatarProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${color}`}
      >
        {initials}
      </span>
      <span className="font-semibold text-[#3b4650]">{name}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const style =
    status === "Approved" ||
    status === "Active" ||
    status === "Present" ||
    status === "Paid"
      ? "bg-[#e8f2ed] text-[#3e806a]"
      : status === "Pending" || status === "Late"
        ? "bg-[#fff4df] text-[#b47c1f]"
        : "bg-[#fbecec] text-[#bd5d5d]";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}

export function ContentPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-[#e1e8e7] bg-white shadow-[0_2px_5px_rgba(33,47,55,0.035)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SimpleTable({
  headers,
  children,
  className = "",
  tableClassName = "",
}: {
  headers: string[];
  children: ReactNode;
  className?: string;
  tableClassName?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className={`w-full min-w-[780px] border-collapse text-left ${tableClassName}`}
      >
        <thead className="bg-[#fbfcfc]">
          <tr className="border-b border-[#e7edec]">
            {headers.map((header) => (
              <th
                key={header}
                className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#74808a]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function RequestTableSkeleton({
  columns,
  rows = 7,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr
          key={rowIndex}
          aria-hidden="true"
          className="animate-pulse border-b border-[#e8edec] bg-white last:border-b-0"
        >
          {Array.from({ length: columns }, (_, columnIndex) => (
            <td key={columnIndex} className="px-5 py-4">
              <div
                className={`h-4 rounded bg-slate-100 ${
                  columnIndex === 0 ? "w-32" : columnIndex === columns - 1 ? "w-16" : "w-20"
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-[#e8edec] bg-white last:border-b-0">
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-5 py-4 text-[15px] text-[#52606a] ${className}`}>
      {children}
    </td>
  );
}
