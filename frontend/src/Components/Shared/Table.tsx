"use client";

import { useMemo, useState, type ReactNode } from "react";

export type TableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  emptyMessage?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
};

export default function Table<T>({
  columns,
  data,
  getRowId,
  emptyMessage = "No data found.",
  selectable = false,
  onSelectionChange,
}: TableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allVisibleIds = useMemo(() => data.map(getRowId), [data, getRowId]);
  const allSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  function updateSelection(nextSelection: string[]) {
    setSelectedIds(nextSelection);
    onSelectionChange?.(nextSelection);
  }

  function toggleAllRows() {
    updateSelection(allSelected ? [] : allVisibleIds);
  }

  function toggleRow(id: string) {
    updateSelection(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  return (
    <div className="min-h-[70vh] overflow-x-auto">
      <table className="w-full min-w-240 border-collapse text-left">
        <thead className="bg-[#fbfcfc]">
          <tr className="border-b border-[#e5ebea]">
            {selectable ? (
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAllRows}
                  aria-label="Select all rows"
                  className="size-4 cursor-pointer rounded border-[#b8c2c1] accent-[#1d625b]"
                />
              </th>
            ) : null}
            {columns.map((column) => (
              <th
                key={column.id}
                className={`whitespace-nowrap px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-[#74808a] ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((row) => {
              const rowId = getRowId(row);

              return (
                <tr
                  key={rowId}
                  className="border-b border-[#e8edec] bg-white transition hover:bg-[#f8fbfa]"
                >
                  {selectable ? (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(rowId)}
                        onChange={() => toggleRow(rowId)}
                        aria-label={`Select row ${rowId}`}
                        className="size-4 cursor-pointer rounded border-[#b8c2c1] accent-[#1d625b]"
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`px-3 py-3 text-[13px] text-[#4c5962] ${column.className ?? ""}`}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-6 py-10 text-center text-xs text-[#7d8992]"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
