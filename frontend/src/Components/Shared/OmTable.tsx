"use client";

import Pagination from "./Pagination";
import Table, { type TableColumn } from "./Table";

type OmTableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  emptyMessage: string;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  title?: string;
};

export default function OmTable<T>({
  title,
  columns,
  data,
  getRowId,
  emptyMessage,
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: OmTableProps<T>) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {title && (
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-800">{title}</h2>
        </div>
      )}
      <Table
        columns={columns}
        data={data}
        getRowId={getRowId}
        emptyMessage={emptyMessage}
      />
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </section>
  );
}
